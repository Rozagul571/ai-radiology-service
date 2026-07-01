"""
Avicenna ⚕️ — AI Inference Service
Analyzes any chest X-ray image and returns pathology probabilities.

Modes:
  1. TorchXRayVision (real AI): pip install torchxrayvision torch torchvision
  2. Heuristic fallback: works with only pillow + numpy (already installed)

Run: uvicorn main:app --port 8000 --reload
"""

import io, base64, hashlib, time
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Try loading TorchXRayVision (optional, real AI mode)
try:
    import torch
    import torchxrayvision as xrv
    import torchvision.transforms as transforms

    _model = xrv.models.DenseNet(weights="densenet121-res224-all")
    _model.eval()
    REAL_AI = True
    print("✅ TorchXRayVision DenseNet-121 loaded — real AI mode active")
except ImportError:
    REAL_AI = False
    _model = None
    print("ℹ️  TorchXRayVision not found — using heuristic mode (install: pip install torchxrayvision torch)")

# Map TorchXRayVision pathology names → our internal codes
TXV_MAP = {
    "Atelectasis":       "ATELECTASIS",
    "Cardiomegaly":      "CARDIOMEGALY",
    "Consolidation":     "INFILTRATION",
    "Edema":             "PLEURAL_EFFUSION",
    "Effusion":          "PLEURAL_EFFUSION",
    "Emphysema":         "ATELECTASIS",
    "Fibrosis":          "INFILTRATION",
    "Hernia":            "MASS",
    "Infiltration":      "INFILTRATION",
    "Mass":              "MASS",
    "Nodule":            "NODULE",
    "Pleural_Thickening":"PLEURAL_EFFUSION",
    "Pneumonia":         "PNEUMONIA",
    "Pneumothorax":      "PLEURAL_EFFUSION",
}

app = FastAPI(title="Avicenna AI Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class InferRequest(BaseModel):
    image_base64: str


def _infer_real(img: Image.Image) -> list[dict]:
    """TorchXRayVision DenseNet-121 inference."""
    gray = img.convert("L")
    arr = np.array(gray, dtype=np.float32) / 255.0
    # TXV expects values in [-1024, 1024] Hounsfield range (from raw DICOM)
    # For PNG/JPG we approximate by scaling to [-1024, 1024]
    arr = (arr - 0.5) / 0.5 * 1024

    import torch
    tensor = torch.from_numpy(arr).unsqueeze(0).unsqueeze(0)  # [1,1,H,W]
    # Resize to 224
    import torchvision.transforms.functional as F
    tensor = F.resize(tensor, [224, 224])

    with torch.no_grad():
        preds = torch.sigmoid(_model(tensor))[0].numpy()

    # Aggregate by our code
    code_scores: dict[str, float] = {}
    for i, name in enumerate(_model.pathologies):
        code = TXV_MAP.get(name)
        if code:
            code_scores[code] = max(code_scores.get(code, 0.0), float(preds[i]))

    # Add NORMAL inversely proportional to max pathology
    max_p = max(code_scores.values()) if code_scores else 0.0
    code_scores["NORMAL"] = round(max(0.02, 1.0 - max_p * 0.92), 3)

    findings = [{"code": k, "confidence": round(float(v), 3)} for k, v in code_scores.items()]
    findings.sort(key=lambda x: -x["confidence"])
    return findings


def _infer_heuristic(img: Image.Image) -> list[dict]:
    """
    Demo-grade inference using image statistics.
    Gives consistent per-image results without GPU/PyTorch.
    Different images → different pathology distributions.
    """
    gray = img.convert("L").resize((224, 224))
    arr = np.array(gray, dtype=np.float32) / 255.0

    # Stable seed from image content
    digest = hashlib.sha256(arr.tobytes()).hexdigest()
    seed = int(digest[:8], 16)
    rng = np.random.RandomState(seed)

    # Image statistics → rough pathology signal
    mean = float(arr.mean())
    std = float(arr.std())
    # Dark + high-contrast images → more pathology (typical for real X-rays with findings)
    base = float(np.clip(std * 3.2 + (0.45 - mean) * 0.9, 0.08, 0.94))

    CODES = [
        "PNEUMONIA", "TUBERCULOSIS", "CARDIOMEGALY", "PLEURAL_EFFUSION",
        "MASS", "NODULE", "ATELECTASIS", "INFILTRATION",
    ]

    # Dirichlet distribution gives realistic multi-label co-occurrence
    raw = rng.dirichlet(np.ones(len(CODES)) * 1.8)
    probs: dict[str, float] = {}
    for i, code in enumerate(CODES):
        probs[code] = round(float(np.clip(raw[i] * base * 1.45, 0.02, 0.97)), 3)

    # NORMAL is inversely weighted
    max_p = max(probs.values())
    probs["NORMAL"] = round(float(np.clip(1.0 - max_p * 0.88, 0.03, 0.92)), 3)

    findings = [{"code": k, "confidence": v} for k, v in probs.items()]
    findings.sort(key=lambda x: -x["confidence"])
    return findings


@app.post("/infer")
async def infer(req: InferRequest):
    try:
        raw = base64.b64decode(req.image_base64)
        img = Image.open(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decode error: {e}")

    t0 = time.time()
    if REAL_AI:
        findings = _infer_real(img)
        model_name = "TorchXRayVision DenseNet-121"
    else:
        findings = _infer_heuristic(img)
        model_name = "Avicenna HeuristicNet v1.0 (demo)"

    return {
        "findings": findings,
        "latencyMs": round((time.time() - t0) * 1000),
        "model": model_name,
        "realAI": REAL_AI,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "realAI": REAL_AI}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
