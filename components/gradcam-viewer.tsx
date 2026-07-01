"use client"

import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { Finding } from "@/lib/types"
import { cn } from "@/lib/utils"

export function GradcamViewer({
  imageUrl,
  findings,
  className,
}: {
  imageUrl: string
  findings: Finding[]
  className?: string
}) {
  const [showHeat, setShowHeat] = useState(true)
  const [showBox, setShowBox] = useState(true)
  const top = findings[0]

  return (
    <div className={cn("relative", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-black">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Tahlil qilingan ko'krak rentgeni"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 520px"
        />

        {showHeat && top && (
          <div
            className="pointer-events-none absolute rounded-full mix-blend-screen blur-xl"
            style={{
              left: `${top.bbox[0]}%`,
              top: `${top.bbox[1]}%`,
              width: `${top.bbox[2] + 12}%`,
              height: `${top.bbox[3] + 12}%`,
              background:
                "radial-gradient(circle, rgba(239,68,68,0.75), rgba(251,146,60,0.4) 45%, transparent 72%)",
            }}
          />
        )}

        {showBox &&
          findings.slice(0, 3).map((f, i) => (
            <div
              key={f.code}
              className={cn(
                "pointer-events-none absolute rounded-lg border-2",
                i === 0 ? "border-destructive/90" : "border-primary/60",
              )}
              style={{
                left: `${f.bbox[0]}%`,
                top: `${f.bbox[1]}%`,
                width: `${f.bbox[2]}%`,
                height: `${f.bbox[3]}%`,
              }}
            >
              <span
                className={cn(
                  "absolute -top-5 left-0 rounded px-1 py-0.5 font-mono text-[10px] font-semibold text-white",
                  i === 0 ? "bg-destructive" : "bg-primary",
                )}
              >
                {f.code} {f.confidence.toFixed(2)}
              </span>
            </div>
          ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowHeat((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            showHeat ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border text-muted-foreground",
          )}
        >
          {showHeat ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          Grad-CAM
        </button>
        <button
          onClick={() => setShowBox((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            showBox ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground",
          )}
        >
          {showBox ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          Bounding box
        </button>
      </div>
    </div>
  )
}
