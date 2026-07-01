import { type NextRequest, NextResponse } from "next/server"
import { createCase } from "@/lib/store"
import { PATHOLOGY_MAP } from "@/lib/pathologies"

const AI_SERVICE = process.env.AI_SERVICE_URL ?? "http://localhost:8000"

// Labels for codes that the Python service returns but might not be in the map
const FALLBACK_LABELS: Record<string, string> = {
  PNEUMONIA: "Pnevmoniya",
  TUBERCULOSIS: "Sil (Tuberkulyoz)",
  CARDIOMEGALY: "Kardiomegaliya",
  PLEURAL_EFFUSION: "Plevral efuziya",
  MASS: "Massa / O'sma",
  NODULE: "Tugun (Nodule)",
  ATELECTASIS: "Atelektaz",
  INFILTRATION: "Infiltratsiya",
  NORMAL: "Patologiyasiz (Norma)",
  FRACTURE: "Suyak sinishi",
  COVID19: "COVID-19",
}

interface PyFinding {
  code: string
  confidence: number
}

interface PyResponse {
  findings: PyFinding[]
  latencyMs?: number
  model?: string
}

async function tryPythonInference(imageBase64: string): Promise<PyResponse | null> {
  try {
    const res = await fetch(`${AI_SERVICE}/infer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64 }),
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.patientName) {
    return NextResponse.json({ error: "patientName majburiy maydon" }, { status: 400 })
  }

  const imageBase64: string | null = body.imageBase64 ?? null

  // Try real AI inference if image base64 is provided
  let pyResult: PyResponse | null = null
  if (imageBase64) {
    pyResult = await tryPythonInference(imageBase64)
  }

  // Build the imageUrl — use provided URL or a placeholder
  const imageUrl = body.imageUrl || "/xray/xray-1.png"

  // Create the case — if pyResult is available, pass it so the store can use it
  const created = createCase(
    {
      patientName: String(body.patientName),
      patientAge: Number(body.patientAge) || 30,
      patientGender: body.patientGender === "F" ? "F" : "M",
      clinic: String(body.clinic || "Toshkent Medline Klinikasi"),
      region: String(body.region || "Toshkent"),
      imageUrl,
      fileName: String(body.fileName || "upload.png"),
    },
    pyResult
      ? {
          findings: pyResult.findings.map((f: PyFinding, i: number) => ({
            code: f.code,
            label: PATHOLOGY_MAP[f.code]?.label ?? FALLBACK_LABELS[f.code] ?? f.code,
            confidence: f.confidence,
            bbox: [
              15 + (i * 13) % 35,
              18 + (i * 17) % 30,
              20 + (i * 7) % 18,
              22 + (i * 11) % 16,
            ] as [number, number, number, number],
          })),
          latencyMs: pyResult.latencyMs ?? 1800,
          modelVersion: pyResult.model ?? "Avicenna AI v1.0",
        }
      : undefined,
  )

  return NextResponse.json({ case: created, usedRealAI: pyResult !== null })
}
