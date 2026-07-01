import type { AIInferenceResult, Finding, ReferralPayload, RiskTier, SpecialtyKey } from "./types"
import { PATHOLOGIES, PATHOLOGY_MAP, RISK_ORDER, SPECIALTIES, routeSpecialty } from "./pathologies"
import { pickSpecialistDoctor } from "./doctors"

// Simple seeded PRNG (mulberry32) so results are reproducible per file.
function seeded(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function riskFromConfidence(base: RiskTier, confidence: number): RiskTier {
  // escalate risk when the model is very confident about a serious finding
  if (base === "CRITICAL") return "CRITICAL"
  if (base === "HIGH") return confidence > 0.9 ? "CRITICAL" : "HIGH"
  if (base === "MEDIUM") return confidence > 0.85 ? "HIGH" : "MEDIUM"
  return confidence > 0.8 ? "MEDIUM" : "LOW"
}

/**
 * Simulated multi-label inference. In production this is a DenseNet-121
 * (CheXNet) forward pass returning per-pathology sigmoid probabilities
 * plus a Grad-CAM heatmap. Here we derive stable pseudo-probabilities
 * from the file identity so the demo is deterministic and believable.
 */
export function runInference(fileKey: string, forcedCode?: string): AIInferenceResult {
  const rand = seeded(hashString(fileKey))
  const start = Date.now()

  const candidates = PATHOLOGIES.filter((p) => p.code !== "NORMAL")
  const primary = forcedCode
    ? PATHOLOGY_MAP[forcedCode]
    : candidates[Math.floor(rand() * candidates.length)]

  const isNormal = !forcedCode && rand() < 0.18
  const findings: Finding[] = []

  if (isNormal || primary.code === "NORMAL") {
    findings.push({
      code: "NORMAL",
      label: PATHOLOGY_MAP.NORMAL.label,
      confidence: 0.9 + rand() * 0.08,
      bbox: [30, 28, 40, 44],
    })
    return {
      findings,
      primaryCode: "NORMAL",
      riskTier: "LOW",
      heatIntensity: 0.12,
      latencyMs: 1400 + Math.floor(rand() * 900),
      modelVersion: "CheXNet-DenseNet121 v2.3",
    }
  }

  const primaryConf = 0.72 + rand() * 0.26
  findings.push({
    code: primary.code,
    label: primary.label,
    confidence: Math.min(0.99, primaryConf),
    bbox: [
      18 + rand() * 34,
      20 + rand() * 30,
      22 + rand() * 20,
      24 + rand() * 22,
    ],
  })

  // add 1-2 secondary co-findings
  const extras = candidates
    .filter((p) => p.code !== primary.code)
    .sort(() => rand() - 0.5)
    .slice(0, 1 + Math.floor(rand() * 2))
  for (const e of extras) {
    findings.push({
      code: e.code,
      label: e.label,
      confidence: 0.18 + rand() * 0.4,
      bbox: [20 + rand() * 40, 22 + rand() * 34, 16 + rand() * 16, 16 + rand() * 16],
    })
  }

  findings.sort((a, b) => b.confidence - a.confidence)
  const top = findings[0]
  const riskTier = riskFromConfidence(PATHOLOGY_MAP[top.code].baseRisk, top.confidence)

  return {
    findings,
    primaryCode: top.code,
    riskTier,
    heatIntensity: 0.45 + top.confidence * 0.5,
    latencyMs: 1500 + Math.floor(rand() * 900),
    modelVersion: "CheXNet-DenseNet121 v2.3",
  }
}

export function riskWeight(tier: RiskTier): number {
  return RISK_ORDER[tier]
}

/**
 * Build the referral + Telegram notification payload once a case is APPROVED.
 * Applies the specialist routing matrix and produces a localized markdown
 * prescription/referral snippet for the patient.
 */
export function buildReferral(params: {
  confirmedCode: string
  patientName: string
  clinic: string
  seed: number
}): ReferralPayload {
  const { confirmedCode, patientName, clinic, seed } = params
  const specialty: SpecialtyKey = routeSpecialty(confirmedCode)
  const spec = SPECIALTIES[specialty]
  const path = PATHOLOGY_MAP[confirmedCode]
  const doctor = pickSpecialistDoctor(specialty, seed)
  const specialistName = doctor.name

  const isNormal = confirmedCode === "NORMAL"
  const today = new Date().toLocaleDateString("uz-UZ")

  const telegramMessage = isNormal
    ? [
        `✅ *Avicenna ⚕️ — AI Radiolog*`,
        ``,
        `Hurmatli *${patientName}*,`,
        `rentgen tahlili muvaffaqiyatli yakunlandi.`,
        ``,
        `📋 Natija: *Patologiyasiz (Norma)*`,
        `🏥 Klinika: ${clinic}`,
        ``,
        `Umumiy amaliyot shifokori patronaj kuzatuvini davom ettiradi.`,
        `📅 Sana: ${today}`,
        ``,
        `_Avicenna AI — Klinik qaror davolovchi shifokorda._`,
      ].join("\n")
    : [
        `⚕️ *Avicenna ⚕️ — AI Radiolog natijasi*`,
        ``,
        `Hurmatli *${patientName}*,`,
        `rentgen natijangiz radiolog tomonidan tasdiqlandi.`,
        ``,
        `🔬 Topilma: *${path.label}*`,
        `⚠️ Darajasi: ${path.baseRisk === "CRITICAL" ? "KRITIK" : path.baseRisk === "HIGH" ? "YUQORI" : "O'RTA"}`,
        ``,
        `👨‍⚕️ Yo'naltirildi: *${spec.label}*`,
        `🩺 Shifokor: *${specialistName}*`,
        `🏥 Klinika: ${doctor.clinic}`,
        `📞 Telefon: ${doctor.phone}`,
        `⏱ Murojaat muddati (SLA): *${spec.sla}*`,
        ``,
        `📅 Sana: ${today}`,
        ``,
        `_Avicenna AI — triaj yordamchisi. Yakuniy tashxis davolovchi shifokorda._`,
      ].join("\n")

  const prescriptionMarkdown = isNormal
    ? [
        `# Avicenna ⚕️ — Tibbiy xulosa`,
        ``,
        `| Maydon | Ma'lumot |`,
        `|--------|----------|`,
        `| **Bemor** | ${patientName} |`,
        `| **Klinika** | ${clinic} |`,
        `| **Sana** | ${today} |`,
        `| **Holat ID** | - |`,
        ``,
        `---`,
        ``,
        `## AI Tahlil natijasi`,
        ``,
        `**Ko'krak qafasi rentgenida aniq patologik o'zgarishlar aniqlanmadi.**`,
        ``,
        `*Foydalanilgan model: CheXNet DenseNet-121 v2.3*`,
        ``,
        `---`,
        ``,
        `## Tavsiyalar`,
        ``,
        `- ✅ Umumiy amaliyot shifokori kuzatuvi davom ettirilsin`,
        `- ✅ Profilaktik ko'rik 1 yilda 1 marta`,
        `- ⚠️ Simptomlar kuchaysa — darhol murojaat`,
        ``,
        `---`,
        ``,
        `> ⚕️ *AI yordamchi triaj vositasi. Yakuniy qaror litsenziyalangan davolovchi shifokorda.*`,
      ].join("\n")
    : [
        `# Avicenna ⚕️ — Yo'naltirish varaqasi`,
        ``,
        `| Maydon | Ma'lumot |`,
        `|--------|----------|`,
        `| **Bemor** | ${patientName} |`,
        `| **Klinika** | ${clinic} |`,
        `| **Sana** | ${today} |`,
        ``,
        `---`,
        ``,
        `## Tasdiqlangan topilma`,
        ``,
        `**${path.label}** (${path.labelEn})`,
        ``,
        `> ${path.note}`,
        ``,
        `---`,
        ``,
        `## Yo'naltirish`,
        ``,
        `| | |`,
        `|-|-|`,
        `| **Mutaxassislik** | ${spec.label} |`,
        `| **Shifokor** | ${specialistName} |`,
        `| **Tajriba** | ${doctor.experience} yil |`,
        `| **Klinika** | ${doctor.clinic} |`,
        `| **Manzil** | ${doctor.region} |`,
        `| **Telefon** | ${doctor.phone} |`,
        `| **Murojaat SLA** | ${spec.sla} |`,
        ``,
        `---`,
        ``,
        `## Keyingi qadamlar`,
        ``,
        `1. 📞 Shifokorga qo'ng'iroq qiling yoki Telegram orqali bog'laning`,
        `2. 📋 Ushbu varaqani olib boring`,
        `3. 🏥 Belgilangan vaqtda murojaat qiling`,
        `4. 🔬 Mutaxassis tomonidan qo'shimcha tekshiruvlar buyuriladi`,
        ``,
        `---`,
        ``,
        `> ⚕️ *AI yordamchi triaj vositasi. Yakuniy tashxis litsenziyalangan davolovchi shifokorda.*`,
      ].join("\n")

  return {
    specialty,
    specialtyLabel: spec.label,
    specialistName,
    clinic,
    urgencySla: spec.sla,
    telegramMessage,
    prescriptionMarkdown,
    doctorProfile: doctor,
  }
}
