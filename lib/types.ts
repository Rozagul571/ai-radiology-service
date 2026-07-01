// Avicenna ⚕️ — Core domain types (shared client + server)

export type RiskTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

export type CaseStatus = "PROCESSING" | "PENDING_REVIEW" | "APPROVED" | "MODIFIED" | "REJECTED"

export type ValidationStatus = "APPROVED" | "MODIFIED" | "REJECTED"

export type SpecialtyKey =
  | "PULMONOLOGIST"
  | "CARDIOLOGIST"
  | "ORTHOPEDIC"
  | "ONCOLOGIST"
  | "GENERAL"

export interface DoctorProfile {
  id: string
  name: string
  specialty: SpecialtyKey | "RADIOLOGIST"
  title: string
  experience: number
  clinic: string
  region: string
  phone: string
  photoUrl: string
  languages: string[]
  rating: number
  casesHandled: number
  bio: string
  education: string
  gender: "M" | "F"
  available: boolean
}

export interface Finding {
  code: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
}

export interface AIInferenceResult {
  findings: Finding[]
  primaryCode: string
  riskTier: RiskTier
  heatIntensity: number
  latencyMs: number
  modelVersion: string
}

export interface RadiologistValidation {
  reviewerId: string
  reviewerName: string
  status: ValidationStatus
  notes: string
  confirmedCode: string
  specialty: SpecialtyKey
  reviewedAt: string
}

export interface ReferralPayload {
  specialty: SpecialtyKey
  specialtyLabel: string
  specialistName: string
  clinic: string
  urgencySla: string
  telegramMessage: string
  prescriptionMarkdown: string
  doctorProfile: DoctorProfile
}

export interface RadiologyCase {
  id: string
  patientName: string
  patientAge: number
  patientGender: "M" | "F"
  clinic: string
  region: string
  imageUrl: string
  createdAt: string
  status: CaseStatus
  ai: AIInferenceResult
  validation: RadiologistValidation | null
  referral: ReferralPayload | null
}
