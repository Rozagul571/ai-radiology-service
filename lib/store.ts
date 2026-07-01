import type { RadiologyCase, ValidationStatus, Finding, RiskTier } from "./types"
import { generateSeedCases } from "./mock-data"
import { runInference, hashString, riskWeight, buildReferral } from "./ai"
import { PATHOLOGY_MAP, RISK_ORDER, routeSpecialty } from "./pathologies"

const globalForStore = globalThis as unknown as { __avicennaCases?: RadiologyCase[] }

function db(): RadiologyCase[] {
  if (!globalForStore.__avicennaCases) {
    globalForStore.__avicennaCases = generateSeedCases(25)
  }
  return globalForStore.__avicennaCases
}

export function listQueue(): RadiologyCase[] {
  return [...db()]
    .filter((c) => c.status === "PENDING_REVIEW" || c.status === "PROCESSING")
    .sort((a, b) => {
      const r = riskWeight(a.ai.riskTier) - riskWeight(b.ai.riskTier)
      if (r !== 0) return r
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
}

export function listAll(): RadiologyCase[] {
  return [...db()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getCase(id: string): RadiologyCase | undefined {
  return db().find((c) => c.id === id)
}

export function stats() {
  const all = db()
  const pending = all.filter((c) => c.status === "PENDING_REVIEW").length
  const critical = all.filter((c) => c.ai.riskTier === "CRITICAL" && c.status === "PENDING_REVIEW").length
  const approved = all.filter((c) => ["APPROVED", "MODIFIED"].includes(c.status)).length
  const rejected = all.filter((c) => c.status === "REJECTED").length
  const avgConfidence =
    all.reduce((s, c) => s + (c.ai.findings[0]?.confidence ?? 0), 0) / (all.length || 1)
  return { total: all.length, pending, critical, approved, rejected, avgConfidence }
}

function tierFromConfidence(confidence: number, baseRisk: RiskTier): RiskTier {
  if (baseRisk === "CRITICAL") return "CRITICAL"
  if (baseRisk === "HIGH") return confidence > 0.88 ? "CRITICAL" : "HIGH"
  if (baseRisk === "MEDIUM") return confidence > 0.82 ? "HIGH" : "MEDIUM"
  return confidence > 0.78 ? "MEDIUM" : "LOW"
}

interface PyInferenceInput {
  findings: Finding[]
  latencyMs: number
  modelVersion: string
}

export function createCase(
  input: {
    patientName: string
    patientAge: number
    patientGender: "M" | "F"
    clinic: string
    region: string
    imageUrl: string
    fileName: string
  },
  pyInference?: PyInferenceInput,
): RadiologyCase {
  const fileKey = `${input.fileName}-${input.patientName}-${Date.now()}`
  const id = `AVC-${String(2000 + Math.floor(Math.random() * 8000)).padStart(4, "0")}`

  let ai = runInference(fileKey)

  // Override with real Python AI results if provided
  if (pyInference && pyInference.findings.length > 0) {
    const top = pyInference.findings[0]
    const pathDef = PATHOLOGY_MAP[top.code]
    const riskTier = pathDef
      ? tierFromConfidence(top.confidence, pathDef.baseRisk)
      : top.confidence > 0.7 ? "HIGH" : "MEDIUM"

    ai = {
      findings: pyInference.findings,
      primaryCode: top.code,
      riskTier,
      heatIntensity: 0.4 + top.confidence * 0.55,
      latencyMs: pyInference.latencyMs,
      modelVersion: pyInference.modelVersion,
    }
  }

  const newCase: RadiologyCase = {
    id,
    ...input,
    createdAt: new Date().toISOString(),
    status: "PENDING_REVIEW",
    ai,
    validation: null,
    referral: null,
  }
  db().unshift(newCase)
  return newCase
}

export function validateCase(
  id: string,
  input: {
    reviewerId: string
    reviewerName: string
    status: ValidationStatus
    notes: string
    confirmedCode?: string
  },
): RadiologyCase | undefined {
  const c = getCase(id)
  if (!c) return undefined

  const confirmedCode =
    input.status === "MODIFIED" && input.confirmedCode
      ? input.confirmedCode
      : c.ai.primaryCode

  c.validation = {
    reviewerId: input.reviewerId,
    reviewerName: input.reviewerName,
    status: input.status,
    notes: input.notes,
    confirmedCode,
    specialty: routeSpecialty(confirmedCode),
    reviewedAt: new Date().toISOString(),
  }
  c.status = input.status

  if (input.status === "APPROVED" || input.status === "MODIFIED") {
    c.referral = buildReferral({
      confirmedCode,
      patientName: c.patientName,
      clinic: c.clinic,
      seed: hashString(c.id),
    })
  } else {
    c.referral = null
  }
  return c
}

export function labelOf(code: string): string {
  return PATHOLOGY_MAP[code]?.label ?? code
}
