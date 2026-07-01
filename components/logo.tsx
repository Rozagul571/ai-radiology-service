import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-emerald text-primary-foreground shadow-lg shadow-primary/25">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v18M3 12h18" opacity={0.55} />
          <path d="M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5" />
        </svg>
      </span>
      <span className="text-base">
        Avicenna <span className="text-emerald">⚕</span>
      </span>
    </span>
  )
}
