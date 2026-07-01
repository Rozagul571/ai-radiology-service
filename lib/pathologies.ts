import type { RiskTier, SpecialtyKey } from "./types"

// 14-label chest pathology space aligned with NIH ChestX-ray14 / CheXpert
// plus a couple of triage-relevant additions for the demo.
export interface PathologyDef {
  code: string
  label: string // Uzbek label
  labelEn: string
  baseRisk: RiskTier
  specialty: SpecialtyKey
  // Localized short clinical description shown to the doctor/patient
  note: string
}

export const PATHOLOGIES: PathologyDef[] = [
  {
    code: "PNEUMONIA",
    label: "Pnevmoniya",
    labelEn: "Pneumonia",
    baseRisk: "HIGH",
    specialty: "PULMONOLOGIST",
    note: "O'pkada yallig'lanish belgilari aniqlandi. Pulmonolog ko'rigi tavsiya etiladi.",
  },
  {
    code: "TUBERCULOSIS",
    label: "Sil (Tuberkulyoz)",
    labelEn: "Tuberculosis",
    baseRisk: "CRITICAL",
    specialty: "PULMONOLOGIST",
    note: "Silga xos infiltrativ o'zgarishlar. Zudlik bilan ftiziatr-pulmonolog ko'rigi.",
  },
  {
    code: "COVID19",
    label: "COVID-19 (virusli pnevmoniya)",
    labelEn: "COVID-19",
    baseRisk: "HIGH",
    specialty: "PULMONOLOGIST",
    note: "Ikki tomonlama matoviy shishasimon soyalar. Pulmonolog ko'rigi va SpO2 nazorati.",
  },
  {
    code: "CARDIOMEGALY",
    label: "Kardiomegaliya (yurak kattalashuvi)",
    labelEn: "Cardiomegaly",
    baseRisk: "HIGH",
    specialty: "CARDIOLOGIST",
    note: "Yurak soyasi kattalashgan. Kardiolog ko'rigi va EXO-KG tavsiya etiladi.",
  },
  {
    code: "PLEURAL_EFFUSION",
    label: "Plevral efuziya (suyuqlik)",
    labelEn: "Pleural Effusion",
    baseRisk: "HIGH",
    specialty: "PULMONOLOGIST",
    note: "Plevra bo'shlig'ida suyuqlik to'planishi. Pulmonolog ko'rigi zarur.",
  },
  {
    code: "MASS",
    label: "Massa / O'sma (shubhali)",
    labelEn: "Mass / Tumor",
    baseRisk: "CRITICAL",
    specialty: "ONCOLOGIST",
    note: "Hajmli hosila shubhasi. Onkolog / torakal jarroh ko'rigi va KT tekshiruvi.",
  },
  {
    code: "NODULE",
    label: "Tugun (Nodule)",
    labelEn: "Nodule",
    baseRisk: "MEDIUM",
    specialty: "ONCOLOGIST",
    note: "Yakka tugun aniqlandi. Onkolog kuzatuvi va dinamik nazorat kerak.",
  },
  {
    code: "FRACTURE",
    label: "Suyak sinishi",
    labelEn: "Fracture",
    baseRisk: "HIGH",
    specialty: "ORTHOPEDIC",
    note: "Suyak yaxlitligining buzilishi. Ortoped-travmatolog ko'rigi zarur.",
  },
  {
    code: "ATELECTASIS",
    label: "Atelektaz",
    labelEn: "Atelectasis",
    baseRisk: "MEDIUM",
    specialty: "PULMONOLOGIST",
    note: "O'pka to'qimasining yopishishi. Pulmonolog ko'rigi tavsiya etiladi.",
  },
  {
    code: "INFILTRATION",
    label: "Infiltratsiya",
    labelEn: "Infiltration",
    baseRisk: "MEDIUM",
    specialty: "PULMONOLOGIST",
    note: "O'pkada infiltrativ soyalar. Klinik korrelyatsiya kerak.",
  },
  {
    code: "NORMAL",
    label: "Patologiyasiz (Norma)",
    labelEn: "Normal",
    baseRisk: "LOW",
    specialty: "GENERAL",
    note: "Aniq patologik o'zgarishlar topilmadi. Umumiy amaliyot shifokori kuzatuvi.",
  },
]

export const PATHOLOGY_MAP: Record<string, PathologyDef> = Object.fromEntries(
  PATHOLOGIES.map((p) => [p.code, p]),
)

// ── Specialist routing matrix ────────────────────────────────────────────────
export interface SpecialtyDef {
  key: SpecialtyKey
  label: string // Uzbek
  labelEn: string
  sla: string
  poolNames: string[]
}

export const SPECIALTIES: Record<SpecialtyKey, SpecialtyDef> = {
  PULMONOLOGIST: {
    key: "PULMONOLOGIST",
    label: "Pulmonolog (O'pka shifokori)",
    labelEn: "Pulmonologist",
    sla: "< 2 soat",
    poolNames: ["Dr. Nodira Yusupova", "Dr. Sardor Aliyev", "Dr. Kamola Rasulova"],
  },
  CARDIOLOGIST: {
    key: "CARDIOLOGIST",
    label: "Kardiolog",
    labelEn: "Cardiologist",
    sla: "< 4 soat",
    poolNames: ["Dr. Bekzod Karimov", "Dr. Dilnoza Ismoilova"],
  },
  ORTHOPEDIC: {
    key: "ORTHOPEDIC",
    label: "Ortoped-Travmatolog",
    labelEn: "Orthopedic Surgeon",
    sla: "< 3 soat",
    poolNames: ["Dr. Jasur To'raev", "Dr. Aziza Qodirova"],
  },
  ONCOLOGIST: {
    key: "ONCOLOGIST",
    label: "Onkolog / Torakal jarroh",
    labelEn: "Oncologist / Thoracic Surgeon",
    sla: "< 1 soat",
    poolNames: ["Dr. Rustam Egamov", "Dr. Malika Sattorova"],
  },
  GENERAL: {
    key: "GENERAL",
    label: "Umumiy amaliyot shifokori (Patronaj)",
    labelEn: "General Practitioner",
    sla: "24 soat ichida",
    poolNames: ["Dr. Oybek Nazarov", "Dr. Zilola Umarova"],
  },
}

// Deterministic-ish pool pick without extra deps
export function pickSpecialist(key: SpecialtyKey, seed: number): string {
  const pool = SPECIALTIES[key].poolNames
  return pool[seed % pool.length]
}

export function routeSpecialty(code: string): SpecialtyKey {
  return PATHOLOGY_MAP[code]?.specialty ?? "GENERAL"
}

export const RISK_ORDER: Record<RiskTier, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
}
