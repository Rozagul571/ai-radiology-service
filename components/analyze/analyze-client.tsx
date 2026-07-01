"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Upload,
  Loader2,
  ArrowRight,
  Download,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  ImageIcon,
  Sparkles,
} from "lucide-react"
import type { RadiologyCase } from "@/lib/types"
import { RiskBadge } from "@/components/risk-badge"
import { GradcamViewer } from "@/components/gradcam-viewer"
import { PATHOLOGY_MAP } from "@/lib/pathologies"
import { cn } from "@/lib/utils"

const SAMPLES = [
  { url: "/xray/xray-1.png", label: "Namuna 1", hint: "Ko'krak PA" },
  { url: "/xray/xray-2.png", label: "Namuna 2", hint: "Ko'krak LAT" },
  { url: "/xray/xray-3.png", label: "Namuna 3", hint: "Ko'krak AP" },
  { url: "/xray/xray-4.png", label: "Namuna 4", hint: "Ko'krak PA" },
]

const STAGES = [
  { label: "Rasm yuklanmoqda", icon: "📤" },
  { label: "Oldingi ishlov (CLAHE, 224×224)", icon: "🔧" },
  { label: "DenseNet-121 inference", icon: "🧠" },
  { label: "Grad-CAM issiqlik xaritasi", icon: "🔥" },
  { label: "Triaj qoidasi qo'llanilmoqda", icon: "⚖️" },
]

type Phase = "idle" | "processing" | "done"

export function AnalyzeClient() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [selected, setSelected] = useState<string>(SAMPLES[0].url)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [stage, setStage] = useState(0)
  const [result, setResult] = useState<RadiologyCase | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [usedRealAI, setUsedRealAI] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const activeImage = preview ?? selected

  const readFileAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        // strip "data:image/...;base64," prefix
        const base64 = dataUrl.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  function onFile(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setUploadedFileName(file.name)
    setResult(null)
    setPhase("idle")
    // Read base64 for real AI inference
    readFileAsBase64(file).then(setImageBase64)
  }

  async function analyze() {
    setPhase("processing")
    setResult(null)
    setStage(0)

    for (let i = 0; i < STAGES.length; i++) {
      setStage(i)
      await new Promise((r) => setTimeout(r, 380))
    }

    const body: Record<string, unknown> = {
      patientName: "Demo Bemor",
      patientAge: 38,
      patientGender: "M",
      clinic: "Toshkent Medline Klinikasi",
      region: "Toshkent",
      imageUrl: preview ? "/xray/xray-1.png" : selected,
      fileName: uploadedFileName ?? "demo-upload.png",
    }

    // If user uploaded their own file, send base64 for real AI
    if (imageBase64) {
      body.imageBase64 = imageBase64
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setResult(data.case)
    setUsedRealAI(Boolean(data.usedRealAI))
    setPhase("done")
  }

  function reset() {
    setPhase("idle")
    setResult(null)
    setPreview(null)
    setImageBase64(null)
    setUploadedFileName(null)
    setUsedRealAI(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            AI Rentgen tahlili
          </h1>
          {usedRealAI && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-0.5 text-xs font-semibold text-emerald border border-emerald/25">
              <Sparkles className="size-3" /> Real AI
            </span>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Ko'krak qafasi rentgenini yuklang — istalgan rasm formati (JPG, PNG, DICOM).
          AI ~2 daqiqada multi-label tahlil beradi va radiolog navbatiga yo'naltiradi.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: upload + viewer */}
        <div className="glass rounded-2xl p-5">
          {phase === "done" && result ? (
            <GradcamViewer imageUrl={result.imageUrl} findings={result.ai.findings} />
          ) : (
            <>
              {/* Drag & Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) onFile(f)
                }}
                className={cn(
                  "relative flex overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
                  dragOver ? "border-primary bg-primary/8 scale-[1.01]" : "border-border/60",
                  activeImage ? "aspect-square bg-black/90" : "aspect-square items-center justify-center bg-card/40",
                )}
              >
                {activeImage ? (
                  <>
                    <Image
                      src={activeImage}
                      alt="Yuklangan rentgen"
                      fill
                      className="object-cover opacity-90"
                      sizes="(max-width: 1024px) 100vw, 520px"
                    />
                    {phase === "processing" && (
                      <>
                        <div className="absolute inset-0 bg-grid opacity-20" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 animate-scan bg-[linear-gradient(to_bottom,transparent,rgba(99,102,241,0.5),rgba(52,211,153,0.2),transparent)]">
                          <div className="absolute inset-x-0 top-1/2 h-px bg-primary shadow-[0_0_20px_3px_var(--primary)]" />
                        </div>
                      </>
                    )}
                    {/* Corner brackets */}
                    {["left-3 top-3 border-l-2 border-t-2","right-3 top-3 border-r-2 border-t-2","left-3 bottom-3 border-l-2 border-b-2","right-3 bottom-3 border-r-2 border-b-2"].map((p) => (
                      <span key={p} className={cn("absolute size-7 border-primary/60", p)} />
                    ))}
                    {uploadedFileName && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 backdrop-blur">
                        <CheckCircle className="size-3 text-emerald" />
                        <span className="font-mono text-[11px] text-white truncate max-w-[180px]">{uploadedFileName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center text-muted-foreground p-8">
                    <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <ImageIcon className="size-8" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Rentgen rasmini tashlang</p>
                      <p className="text-sm mt-1">JPG, PNG, DICOM · 20 MB gacha</p>
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Faylni tanlash
                    </button>
                  </div>
                )}

                {dragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/15 backdrop-blur-sm">
                    <div className="text-center text-primary">
                      <Upload className="mx-auto size-10 mb-2" />
                      <p className="font-semibold">Rasmni qo'yib yuboring</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*,.dcm"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />

              {/* File selector + sample thumbnails */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Namuna rasimlar — bosib tanlang:
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <Upload className="size-3.5" /> O'z faylim
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.url}
                      onClick={() => {
                        setSelected(s.url)
                        setPreview(null)
                        setImageBase64(null)
                        setUploadedFileName(null)
                        setResult(null)
                        setPhase("idle")
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.03]",
                        (preview ? false : activeImage === s.url)
                          ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/15"
                          : "border-transparent hover:border-border",
                      )}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                        <Image src={s.url} alt={s.label} fill className="object-cover opacity-85 group-hover:opacity-100 transition-opacity" sizes="140px" />
                        {(preview ? false : activeImage === s.url) && (
                          <div className="absolute inset-0 bg-primary/10 flex items-end p-2">
                            <span className="flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              <CheckCircle className="size-2.5" /> Tanlandi
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="px-2 py-1.5 text-left">
                        <p className="text-xs font-semibold leading-none">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: controls + results */}
        <div className="space-y-4">
          {phase === "idle" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="font-semibold text-lg">Tahlilga tayyor</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {imageBase64
                  ? `"${uploadedFileName}" fayli yuklandi. AI real tahlil qiladi.`
                  : "Tanlangan namuna rentgeni bo'yicha AI multi-label tahlil."}
                {" "}Natijaga Grad-CAM issiqlik xaritasi va xavf darajasi kiritiladi.
              </p>

              {imageBase64 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald/10 border border-emerald/20 px-3 py-2.5">
                  <Sparkles className="size-4 text-emerald shrink-0" />
                  <p className="text-xs text-emerald font-medium">
                    O'z faylingiz: Python AI xizmati (real tahlil) ishlatiladi
                  </p>
                </div>
              )}

              <button
                onClick={analyze}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
              >
                AI tahlilni boshlash <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {phase === "processing" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Loader2 className="size-5 animate-spin text-primary" />
                AI tahlil qilmoqda…
              </div>
              <ul className="mt-6 space-y-4">
                {STAGES.map((s, i) => (
                  <li key={s.label} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-sm transition-all",
                        i < stage
                          ? "bg-emerald text-white"
                          : i === stage
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i < stage ? "✓" : s.icon}
                    </span>
                    <span className={cn("transition-colors", i <= stage ? "text-foreground font-medium" : "text-muted-foreground")}>
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3 w-full animate-shimmer rounded-full shimmer bg-muted" style={{ width: `${90 - i * 15}%` }} />
                ))}
              </div>
            </div>
          )}

          {phase === "done" && result && (
            <ResultPanel result={result} usedRealAI={usedRealAI} onReset={reset} />
          )}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({
  result,
  usedRealAI,
  onReset,
}: {
  result: RadiologyCase
  usedRealAI: boolean
  onReset: () => void
}) {
  const critical = result.ai.riskTier === "CRITICAL"
  return (
    <>
      {critical && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-semibold">Shoshilinch topilma aniqlandi</p>
            <p className="text-sm opacity-90">
              Holat radiolog navbatiga yuqori ustuvorlik bilan yuborildi. Zarur bo'lsa tez tibbiy yordamga murojaat qiling.
            </p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground font-mono">ID · {result.id}</p>
              {usedRealAI && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-semibold text-emerald">
                  <Sparkles className="size-2.5" /> Real AI
                </span>
              )}
            </div>
            <h2 className="mt-1 text-lg font-semibold">Dastlabki AI xulosasi</h2>
          </div>
          <RiskBadge tier={result.ai.riskTier} />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">Asosiy topilma</p>
          <p className="mt-1 text-xl font-semibold">
            {PATHOLOGY_MAP[result.ai.primaryCode]?.label ?? result.ai.primaryCode}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {PATHOLOGY_MAP[result.ai.primaryCode]?.note}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-sm font-medium">Ehtimolliklar</p>
          {result.ai.findings.map((f) => (
            <div key={f.code}>
              <div className="flex items-center justify-between text-sm">
                <span>{PATHOLOGY_MAP[f.code]?.label ?? f.label ?? f.code}</span>
                <span className="font-semibold tabular-nums font-mono">
                  {Math.round(f.confidence * 100)}%
                </span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    f.confidence > 0.65 ? "bg-destructive" : f.confidence > 0.38 ? "bg-chart-4" : "bg-primary",
                  )}
                  style={{ width: `${f.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          {result.ai.modelVersion} · {(result.ai.latencyMs / 1000).toFixed(1)}s
        </p>
      </div>

      <div className="glass flex items-center gap-3 rounded-2xl border border-primary/20 p-4">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
          <UserCheck className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Radiolog navbatiga yuborildi</p>
          <p className="text-xs text-muted-foreground">Yakuniy xulosa radiolog tasdig'idan so'ng chiqadi.</p>
        </div>
        <Link
          href="/radiologist"
          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground whitespace-nowrap"
        >
          Navbatga o'tish
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => window.print()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Download className="size-4" /> Hisobotni yuklash
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <RotateCcw className="size-4" /> Yangi tahlil
        </button>
      </div>
    </>
  )
}
