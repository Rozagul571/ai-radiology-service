import { cn } from "@/lib/utils"
import type { RiskTier } from "@/lib/types"

const RISK_STYLES: Record<RiskTier, { cls: string; label: string }> = {
  CRITICAL: { cls: "bg-destructive/12 text-destructive border-destructive/30", label: "KRITIK" },
  HIGH: { cls: "bg-chart-4/15 text-chart-4 border-chart-4/30", label: "YUQORI" },
  MEDIUM: { cls: "bg-chart-3/12 text-chart-3 border-chart-3/30", label: "O'RTA" },
  LOW: { cls: "bg-emerald/12 text-emerald border-emerald/30", label: "PAST" },
}

export function RiskBadge({ tier, className }: { tier: RiskTier; className?: string }) {
  const s = RISK_STYLES[tier]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        s.cls,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-current", tier === "CRITICAL" && "animate-pulse")} />
      {s.label}
    </span>
  )
}
