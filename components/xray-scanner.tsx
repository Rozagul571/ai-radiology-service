"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const CHIPS = [
  { label: "Pnevmoniya", value: 0.91, top: "18%", left: "8%" },
  { label: "Kardiomegaliya", value: 0.34, top: "58%", left: "60%" },
  { label: "Effuziya", value: 0.22, top: "78%", left: "12%" },
]

/**
 * Animated chest X-ray scanner used in the hero. Pure CSS animations
 * (respects prefers-reduced-motion). No external animation deps.
 */
export function XrayScanner({ className }: { className?: string }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf: number
    let v = 0
    const tick = () => {
      v = (v + 0.6) % 100
      setProgress(v)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={cn("relative", className)}>
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-chart-3/15 to-emerald/25 blur-2xl" />

      <div className="glass-strong relative overflow-hidden rounded-[2rem] p-3 shadow-2xl shadow-primary/20">
        {/* header bar */}
        <div className="flex items-center justify-between px-2 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-chart-4/70" />
            <span className="size-2.5 rounded-full bg-emerald/70" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">CheXNet · DenseNet-121</span>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
          <Image
            src="/xray/xray-1.png"
            alt="Ko'krak qafasi rentgen tasviri tahlil qilinmoqda"
            fill
            priority
            className="object-cover opacity-90"
            sizes="(max-width: 768px) 100vw, 480px"
          />

          {/* grid overlay */}
          <div className="absolute inset-0 bg-grid opacity-20" />

          {/* Grad-CAM heatmap blob (pulsing) */}
          <div className="absolute left-[10%] top-[16%] size-28 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.55),transparent_70%)] blur-md animate-float" />

          {/* bounding box */}
          <div className="absolute left-[8%] top-[14%] h-[30%] w-[34%] rounded-lg border-2 border-destructive/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <span className="absolute -top-6 left-0 rounded-md bg-destructive px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
              PNEUMONIA 0.91
            </span>
          </div>

          {/* scan line */}
          <div
            className="pointer-events-none absolute inset-x-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(99,102,241,0.35),rgba(52,211,153,0.15),transparent)]"
            style={{ top: `${progress}%`, transform: "translateY(-50%)" }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-primary shadow-[0_0_16px_2px_var(--primary)]" />
          </div>

          {/* corner brackets */}
          {[
            "left-3 top-3 border-l-2 border-t-2",
            "right-3 top-3 border-r-2 border-t-2",
            "left-3 bottom-3 border-l-2 border-b-2",
            "right-3 bottom-3 border-r-2 border-b-2",
          ].map((pos) => (
            <span key={pos} className={cn("absolute size-6 border-primary/70", pos)} />
          ))}

          {/* live badge */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald" />
            </span>
            <span className="font-mono text-[10px] font-medium text-white">TAHLIL · {Math.round(progress)}%</span>
          </div>
        </div>

        {/* detection chips */}
        <div className="grid grid-cols-3 gap-2 px-1 pt-3">
          {CHIPS.map((c) => (
            <div key={c.label} className="rounded-xl border border-border/70 bg-card/50 px-2.5 py-2">
              <p className="truncate text-[11px] text-muted-foreground">{c.label}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-sm font-semibold tabular-nums">{Math.round(c.value * 100)}%</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", c.value > 0.6 ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${c.value * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating stat card */}
      <div className="absolute -bottom-6 -left-6 hidden animate-float-slow items-center gap-3 rounded-2xl glass-strong px-4 py-3 shadow-xl sm:flex">
        <div className="grid size-10 place-items-center rounded-xl bg-emerald/15 text-emerald">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">2 daqiqada</p>
          <p className="text-xs text-muted-foreground">AI dastlabki tahlil</p>
        </div>
      </div>
    </div>
  )
}
