"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Clock,
  User,
  MapPin,
  Brain,
  Stethoscope,
  Send,
  FileText,
  ChevronRight,
  Loader2,
  Activity,
  HeartPulse,
  Bone,
  Microscope,
  ShieldCheck,
  Star,
  Phone,
  Globe,
  Copy,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { RiskBadge } from "@/components/risk-badge"
import { GradcamViewer } from "@/components/gradcam-viewer"
import { PATHOLOGIES, PATHOLOGY_MAP, SPECIALTIES } from "@/lib/pathologies"
import { RADIOLOGIST_PROFILES, getRadiologistById } from "@/lib/doctors"
import type { RadiologyCase, ValidationStatus, RiskTier, DoctorProfile } from "@/lib/types"
import { cn } from "@/lib/utils"

// ── helpers ──────────────────────────────────────────────────────────────────

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s oldin`
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} daq oldin`
  return `${Math.floor(ms / 3_600_000)} soat oldin`
}

const RISK_BORDER: Record<RiskTier, string> = {
  CRITICAL: "border-l-destructive bg-destructive/4",
  HIGH: "border-l-chart-4 bg-chart-4/4",
  MEDIUM: "border-l-chart-3 bg-chart-3/4",
  LOW: "border-l-emerald bg-emerald/4",
}

const SPECIALTY_ICON: Record<string, React.ElementType> = {
  PULMONOLOGIST: HeartPulse,
  CARDIOLOGIST: Activity,
  ORTHOPEDIC: Bone,
  ONCOLOGIST: Microscope,
  GENERAL: ShieldCheck,
}

// ── Doctor profile card ───────────────────────────────────────────────────────

function DoctorCard({
  doctor,
  badge,
  compact = false,
}: {
  doctor: DoctorProfile
  badge?: string
  compact?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="glass rounded-2xl overflow-hidden border border-border/60">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Photo */}
          <div className="relative shrink-0">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="size-16 rounded-2xl object-cover border-2 border-border shadow-md"
              onError={(e) => {
                const t = e.target as HTMLImageElement
                t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&size=64&background=6366f1&color=fff&rounded=true`
              }}
            />
            {doctor.available && (
              <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald border-2 border-background" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold leading-tight">{doctor.name}</p>
                <p className="text-xs text-primary mt-0.5">{doctor.title}</p>
              </div>
              {badge && (
                <span className="shrink-0 rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-semibold text-emerald border border-emerald/25">
                  {badge}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="size-3 fill-chart-4 text-chart-4" />
                {doctor.rating}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Award className="size-3" />
                {doctor.experience} yil
              </span>
              <span>·</span>
              <span>{doctor.casesHandled.toLocaleString()} holat</span>
            </div>

            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{doctor.clinic}</span>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-3 shrink-0" />
              <span>{doctor.phone}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {doctor.languages.map((l) => (
                <span key={l} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary border border-primary/15">
                  {l}
                </span>
              ))}
            </div>

            {/* Expandable bio */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Batafsil ma'lumot</span>
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2 text-xs text-muted-foreground border-t border-border/60 pt-2">
                <p className="leading-relaxed">{doctor.bio}</p>
                <p className="flex items-start gap-1">
                  <Globe className="size-3 shrink-0 mt-0.5" />
                  {doctor.education}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

interface StatsData {
  total: number
  pending: number
  critical: number
  approved: number
  rejected: number
  avgConfidence: number
}

function StatsBar({ stats }: { stats: StatsData }) {
  const items = [
    { label: "Jami", value: stats.total, color: "text-foreground" },
    { label: "Kutmoqda", value: stats.pending, color: "text-chart-4" },
    { label: "Kritik", value: stats.critical, color: "text-destructive" },
    { label: "Tasdiqlangan", value: stats.approved, color: "text-emerald" },
    { label: "O'rtacha ishonch", value: `${Math.round(stats.avgConfidence * 100)}%`, color: "text-primary" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mb-6">
      {items.map((s) => (
        <div key={s.label} className="glass rounded-2xl px-4 py-3 text-center">
          <p className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Case card in queue ────────────────────────────────────────────────────────

function CaseCard({ c, active, onClick }: { c: RadiologyCase; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl border-l-4 p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg",
        active ? "ring-2 ring-primary shadow-lg shadow-primary/10" : "",
        RISK_BORDER[c.ai.riskTier],
        ["APPROVED","MODIFIED","REJECTED"].includes(c.status) && "opacity-65",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge tier={c.ai.riskTier} />
            <span className="font-mono text-[11px] text-muted-foreground">{c.id}</span>
          </div>
          <p className="mt-1.5 font-semibold leading-none truncate">{c.patientName}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {c.patientAge} yosh · {c.patientGender === "M" ? "Erkak" : "Ayol"} · {c.region}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground">{relTime(c.createdAt)}</p>
          {c.status === "APPROVED" && <span className="mt-1 inline-block rounded-full bg-emerald/15 px-2 py-0.5 text-[10px] font-semibold text-emerald">Tasdiqlandi</span>}
          {c.status === "MODIFIED" && <span className="mt-1 inline-block rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">To'g'irlandi</span>}
          {c.status === "REJECTED" && <span className="mt-1 inline-block rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Rad etildi</span>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-black">
          <Image src={c.imageUrl} alt="" fill className="object-cover opacity-80" sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{PATHOLOGY_MAP[c.ai.primaryCode]?.label ?? c.ai.primaryCode}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", (c.ai.findings[0]?.confidence ?? 0) > 0.6 ? "bg-destructive" : "bg-primary")}
                style={{ width: `${(c.ai.findings[0]?.confidence ?? 0) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {Math.round((c.ai.findings[0]?.confidence ?? 0) * 100)}%
            </span>
          </div>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </button>
  )
}

// ── Validation panel ──────────────────────────────────────────────────────────

function ValidationPanel({ c, onValidated }: { c: RadiologyCase; onValidated: (u: RadiologyCase) => void }) {
  const [status, setStatus] = useState<ValidationStatus>("APPROVED")
  const [notes, setNotes] = useState("")
  const [confirmedCode, setConfirmedCode] = useState(c.ai.primaryCode)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [selectedRad, setSelectedRad] = useState(0)

  const reviewer = RADIOLOGIST_PROFILES[selectedRad]

  async function submit() {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/validate/${c.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerId: reviewer.id,
          reviewerName: reviewer.name,
          status,
          notes,
          confirmedCode: status === "MODIFIED" ? confirmedCode : undefined,
        }),
      })
      if (!res.ok) throw new Error("Server xatosi")
      const data = await res.json()
      onValidated(data.case)
    } catch {
      setError("Yuborishda xato. Qayta urinib ko'ring.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold flex items-center gap-2">
        <Edit3 className="size-4 text-primary" />
        Radiolog tekshiruvi
      </h3>

      {/* Reviewer selector */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Tekshiruvchi radiolog</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {RADIOLOGIST_PROFILES.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedRad(i)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                selectedRad === i
                  ? "border-primary bg-primary/8 ring-2 ring-primary/20"
                  : "border-border/60 hover:bg-accent/50",
                !r.available && "opacity-50",
              )}
              disabled={!r.available}
            >
              <div className="relative shrink-0">
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  className="size-10 rounded-xl object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&size=40&background=6366f1&color=fff`
                  }}
                />
                <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background", r.available ? "bg-emerald" : "bg-muted-foreground")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.title} · {r.experience}y</p>
              </div>
              {selectedRad === i && <Check className="size-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Status buttons */}
      <div className="grid grid-cols-3 gap-2">
        {(["APPROVED", "MODIFIED", "REJECTED"] as ValidationStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all",
              status === s
                ? s === "APPROVED" ? "bg-emerald text-white border-emerald shadow-lg shadow-emerald/25"
                  : s === "MODIFIED" ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                  : "bg-destructive text-white border-destructive shadow-lg shadow-destructive/25"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {s === "APPROVED" && <CheckCircle2 className="size-3.5" />}
            {s === "MODIFIED" && <Edit3 className="size-3.5" />}
            {s === "REJECTED" && <XCircle className="size-3.5" />}
            {s === "APPROVED" ? "Tasdiqlash" : s === "MODIFIED" ? "To'g'irlash" : "Rad etish"}
          </button>
        ))}
      </div>

      {status === "MODIFIED" && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To'g'ri tashxis</label>
          <select
            value={confirmedCode}
            onChange={(e) => setConfirmedCode(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PATHOLOGIES.map((p) => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Klinik izoh</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Radiolog izohi, klinik kuzatuvlar..."
          className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? "Yuborilmoqda…" : "Tekshiruvni yuborish"}
      </button>
    </div>
  )
}

// ── Referral card ─────────────────────────────────────────────────────────────

function ReferralCard({ c }: { c: RadiologyCase }) {
  const [copied, setCopied] = useState(false)
  const [showPrescription, setShowPrescription] = useState(false)
  const ref = c.referral!
  const spec = SPECIALTIES[ref.specialty]
  const Icon = SPECIALTY_ICON[ref.specialty] ?? Stethoscope
  const reviewerProfile = getRadiologistById(c.validation!.reviewerId)

  async function copyTelegram() {
    await navigator.clipboard.writeText(ref.telegramMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Reviewer info */}
      {reviewerProfile && (
        <div className="glass rounded-2xl p-4 border border-emerald/20 bg-emerald/3">
          <p className="text-xs text-emerald font-medium mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            {c.status === "MODIFIED" ? "To'g'irlash kiritdi" : "Tasdiqladi"}
          </p>
          <div className="flex items-center gap-3">
            <img
              src={reviewerProfile.photoUrl}
              alt={reviewerProfile.name}
              className="size-12 rounded-xl object-cover border-2 border-emerald/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerProfile.name)}&size=48&background=10b981&color=fff`
              }}
            />
            <div>
              <p className="font-semibold text-sm">{reviewerProfile.name}</p>
              <p className="text-xs text-muted-foreground">{reviewerProfile.title} · {reviewerProfile.clinic}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="flex items-center gap-0.5 text-chart-4">
                  <Star className="size-3 fill-chart-4" />
                  {reviewerProfile.rating}
                </span>
                <span className="text-muted-foreground">· {reviewerProfile.experience} yil tajriba</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-muted-foreground">Tekshirildi</p>
              <p className="text-xs font-medium">{new Date(c.validation!.reviewedAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
          {c.validation!.notes && (
            <p className="mt-3 text-xs italic text-muted-foreground border-t border-border/60 pt-2">
              "{c.validation!.notes}"
            </p>
          )}
        </div>
      )}

      {/* Assigned specialist doctor card */}
      {ref.doctorProfile && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Icon className="size-3.5 text-primary" />
            Yo'naltirilgan mutaxassis — {spec.label}
          </p>
          <DoctorCard
            doctor={ref.doctorProfile}
            badge={`SLA: ${ref.urgencySla}`}
          />
        </div>
      )}

      {/* Telegram payload */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Send className="size-3.5 text-primary" />
            Telegram xabari (bemorga yuborildi)
          </h4>
          <button
            onClick={copyTelegram}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
          >
            {copied ? <Check className="size-3 text-emerald" /> : <Copy className="size-3" />}
            {copied ? "Nusxalandi" : "Nusxalash"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-card/60 p-3 text-xs leading-relaxed font-mono border border-border/60 max-h-48 overflow-y-auto">
          {ref.telegramMessage}
        </pre>
      </div>

      {/* Prescription toggle */}
      <div className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowPrescription((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-accent/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Yo'naltirish varaqasi (Markdown hujjat)
          </span>
          <span className="text-muted-foreground">{showPrescription ? "▲" : "▼"}</span>
        </button>
        {showPrescription && (
          <pre className="whitespace-pre-wrap border-t border-border/60 bg-card/40 px-5 py-4 text-xs leading-relaxed font-mono max-h-96 overflow-y-auto">
            {ref.prescriptionMarkdown}
          </pre>
        )}
      </div>
    </div>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────

function DetailPane({ c, onValidated }: { c: RadiologyCase; onValidated: (u: RadiologyCase) => void }) {
  const isPending = c.status === "PENDING_REVIEW" || c.status === "PROCESSING"
  const isApproved = c.status === "APPROVED" || c.status === "MODIFIED"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge tier={c.ai.riskTier} />
              <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold">{c.patientName}</h2>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {c.patientAge} yosh · {c.patientGender === "M" ? "Erkak" : "Ayol"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {c.clinic}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {relTime(c.createdAt)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">AI tahlil vaqti</p>
            <p className="font-semibold">{(c.ai.latencyMs / 1000).toFixed(1)}s</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{c.ai.modelVersion}</p>
          </div>
        </div>

        {c.ai.riskTier === "CRITICAL" && isPending && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 animate-pulse" />
            <p className="text-sm font-medium">
              Shoshilinch topilma — SLA: {SPECIALTIES[PATHOLOGY_MAP[c.ai.primaryCode]?.specialty ?? "GENERAL"].sla}
            </p>
          </div>
        )}
      </div>

      {/* GradCAM */}
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 font-semibold flex items-center gap-2">
          <Brain className="size-4 text-primary" />
          Grad-CAM issiqlik xaritasi
        </h3>
        <GradcamViewer imageUrl={c.imageUrl} findings={c.ai.findings} />
      </div>

      {/* AI findings */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          AI topilmalar ({c.ai.findings.length})
        </h3>
        <div className="space-y-3">
          {c.ai.findings.map((f, i) => (
            <div key={f.code}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", i === 0 ? "bg-destructive" : "bg-primary")} />
                  <span className={i === 0 ? "font-semibold" : ""}>
                    {PATHOLOGY_MAP[f.code]?.label ?? f.label ?? f.code}
                  </span>
                </div>
                <span className="font-mono font-semibold tabular-nums">{Math.round(f.confidence * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", f.confidence > 0.7 ? "bg-destructive" : f.confidence > 0.4 ? "bg-chart-4" : "bg-primary")}
                  style={{ width: `${f.confidence * 100}%` }}
                />
              </div>
              {i === 0 && <p className="mt-1 text-xs text-muted-foreground">{PATHOLOGY_MAP[f.code]?.note}</p>}
            </div>
          ))}
        </div>
      </div>

      {isPending ? (
        <ValidationPanel c={c} onValidated={onValidated} />
      ) : isApproved && c.referral ? (
        <ReferralCard c={c} />
      ) : (
        <div className="glass rounded-2xl p-5 text-center text-muted-foreground">
          <XCircle className="mx-auto size-8 mb-2 text-destructive/60" />
          <p className="text-sm font-medium">Holat rad etildi</p>
          {c.validation?.notes && <p className="text-xs mt-1 italic">"{c.validation.notes}"</p>}
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function QueueClient() {
  const [cases, setCases] = useState<RadiologyCase[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all")

  const fetchQueue = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const [qRes, allRes] = await Promise.all([fetch("/api/queue"), fetch("/api/cases")])
      const qData = await qRes.json()
      const allData = await allRes.json()
      const map = new Map<string, RadiologyCase>()
      for (const c of allData.cases as RadiologyCase[]) map.set(c.id, c)
      for (const c of qData.queue as RadiologyCase[]) map.set(c.id, c)
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setCases(merged)
      setStats(allData.stats)
      if (!activeId && merged.length > 0) setActiveId(merged[0].id)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeId])

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(() => fetchQueue(true), 15_000)
    return () => clearInterval(interval)
  }, [fetchQueue])

  function handleValidated(updated: RadiologyCase) {
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    if (stats) {
      setStats({ ...stats, pending: Math.max(0, stats.pending - 1), approved: stats.approved + 1 })
    }
  }

  const filtered = cases.filter((c) => {
    if (filter === "pending") return c.status === "PENDING_REVIEW" || c.status === "PROCESSING"
    if (filter === "done") return ["APPROVED", "MODIFIED", "REJECTED"].includes(c.status)
    return true
  })

  const active = cases.find((c) => c.id === activeId) ?? null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Navbat yuklanmoqda…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Radiolog navbati</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Human-in-the-Loop · AI topilmalarini tasdiqlash, to'g'irlash yoki rad etish
          </p>
        </div>
        <button
          onClick={() => fetchQueue(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          Yangilash
        </button>
      </div>

      {stats && <StatsBar stats={stats} />}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Queue list */}
        <div>
          <div className="mb-4 flex gap-1 rounded-xl border border-border bg-card/50 p-1">
            {(["all", "pending", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
                  filter === f ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "Barchasi" : f === "pending" ? "Kutmoqda" : "Yakunlangan"}
              </button>
            ))}
          </div>

          <div className="space-y-3 overflow-y-auto pr-0.5" style={{ maxHeight: "calc(100vh - 340px)" }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto size-10 mb-3 text-emerald/60" />
                <p className="font-medium">Navbat bo'sh</p>
                <p className="text-xs mt-1">Barcha holatlar ko'rib chiqildi</p>
              </div>
            ) : (
              filtered.map((c) => (
                <CaseCard key={c.id} c={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
              ))
            )}
          </div>
        </div>

        {/* Detail pane */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
          {active ? (
            <DetailPane key={active.id + active.status} c={active} onValidated={handleValidated} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-32 text-center text-muted-foreground">
              <Brain className="mx-auto size-12 mb-3 text-primary/30" />
              <p className="font-medium">Holatni tanlang</p>
              <p className="text-xs mt-1">Chapdan holat tanlang, batafsil ko'ring</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
