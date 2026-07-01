import type { RadiologyCase } from "./types"
import { runInference, hashString } from "./ai"

// Authentic Uzbek first + last names with proper gender agreement
const FIRST_M = [
  "Akbar", "Asilbek", "Aziz", "Behruz", "Bobur", "Doniyor", "Eldor", "Farhod",
  "Hamza", "Humoyun", "Ilhom", "Islom", "Jasur", "Javohir", "Komil", "Laziz",
  "Mansur", "Mirzo", "Muzaffar", "Nodir", "Otabek", "Parviz", "Ravshan",
  "Rustam", "Sanjar", "Sarvar", "Sherzod", "Temur", "Ulugbek", "Zafar",
]
const FIRST_F = [
  "Adolat", "Aziza", "Barno", "Dildora", "Dilnoza", "Dilorom", "Farzona",
  "Feruza", "Gavhar", "Gulbahor", "Hamida", "Hulkar", "Iroda", "Kamola",
  "Lobar", "Maftuna", "Malika", "Mavluda", "Mohira", "Munira", "Nafisa",
  "Nargiza", "Nasiba", "Nozima", "Ozoda", "Sarvinoz", "Sevinch", "Shahlo",
  "Shakhnoza", "Umida", "Xilola", "Yulduz", "Zulfiya", "Zuhra",
]
const LAST_M = [
  "Abdullayev", "Akbarov", "Aliyev", "Aripov", "Askarov", "Azimov",
  "Boboyev", "Ergashev", "Eshmatov", "Hasanov", "Ibragimov", "Ismoilov",
  "Karimov", "Komilov", "Mamatov", "Mirzayev", "Muxtorov", "Nazarov",
  "Normatov", "Pulatov", "Qodirov", "Qosimov", "Rahimov", "Salimov",
  "Sobirov", "Sultonov", "Toshmatov", "Tursunov", "Umarov", "Usmonov",
  "Xolmatov", "Yuldoshev", "Yusupov", "Zaripov",
]
const LAST_F = LAST_M.map((n) => n + "a")

const CLINICS: { clinic: string; region: string }[] = [
  { clinic: "Jizzax Rayon Markaziy Shifoxonasi", region: "Jizzax" },
  { clinic: "Samarqand Shifo Oilaviy Klinikasi", region: "Samarqand" },
  { clinic: "Buxoro Viloyat Ko'p Tarmoqli Tibbiyot Markazi", region: "Buxoro" },
  { clinic: "Namangan Rayon Shifoxonasi", region: "Namangan" },
  { clinic: "Farg'ona Xususiy Klinikasi", region: "Farg'ona" },
  { clinic: "Andijon Sog'liqni Saqlash Markazi", region: "Andijon" },
  { clinic: "Qashqadaryo Viloyat Shifoxonasi", region: "Qashqadaryo" },
  { clinic: "Toshkent Medline Klinikasi", region: "Toshkent" },
  { clinic: "Xorazm Viloyat Tibbiyot Birlashmasi", region: "Xorazm" },
  { clinic: "Navoiy Rayon Markaziy Shifoxonasi", region: "Navoiy" },
  { clinic: "Surxondaryo Viloyat Ko'p Tarmoqli Klinik Shifoxona", region: "Surxondaryo" },
  { clinic: "Toshkent Shahar №14 Shifoxonasi", region: "Toshkent" },
]

const SCENARIO_CODES = [
  "TUBERCULOSIS", "PNEUMONIA", "COVID19", "CARDIOMEGALY", "MASS",
  "NODULE", "PLEURAL_EFFUSION", "ATELECTASIS", "INFILTRATION", "NORMAL",
  "FRACTURE", "TUBERCULOSIS", "PNEUMONIA", "CARDIOMEGALY", "MASS",
]

const XRAYS = ["/xray/xray-1.png", "/xray/xray-2.png", "/xray/xray-3.png", "/xray/xray-4.png"]

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export function generateSeedCases(count = 25): RadiologyCase[] {
  const cases: RadiologyCase[] = []
  const rand = rng(20260101)
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const gender: "M" | "F" = rand() > 0.52 ? "M" : "F"
    const firstPool = gender === "M" ? FIRST_M : FIRST_F
    const lastPool = gender === "M" ? LAST_M : LAST_F
    const first = firstPool[Math.floor(rand() * firstPool.length)]
    const last = lastPool[Math.floor(rand() * lastPool.length)]
    const patientName = `${first} ${last}`
    const site = CLINICS[Math.floor(rand() * CLINICS.length)]
    const code = SCENARIO_CODES[i % SCENARIO_CODES.length]
    const fileKey = `seed-${i}-${patientName}-${code}`
    const ai = runInference(fileKey, code)
    const hoursAgo = Math.floor(rand() * 22)
    const createdAt = new Date(now - hoursAgo * 3_600_000 - Math.floor(rand() * 3_600_000)).toISOString()

    cases.push({
      id: `AVC-${String(1042 + i).padStart(4, "0")}`,
      patientName,
      patientAge: 18 + Math.floor(rand() * 62),
      patientGender: gender,
      clinic: site.clinic,
      region: site.region,
      imageUrl: XRAYS[hashString(fileKey) % XRAYS.length],
      createdAt,
      status: "PENDING_REVIEW",
      ai,
      validation: null,
      referral: null,
    })
  }

  return cases
}
