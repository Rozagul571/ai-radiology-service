import Link from "next/link"
import {
  Upload,
  BrainCircuit,
  UserCheck,
  Share2,
  Activity,
  ShieldCheck,
  Bot,
  LineChart,
  Stethoscope,
  HeartPulse,
  Bone,
  Microscope,
} from "lucide-react"
import { Reveal } from "@/components/reveal"

// ── Trust stats band ─────────────────────────────────────────────────────────
export function StatsBand() {
  const stats = [
    ["200+", "Klinikalar va rayon shifoxonalari"],
    ["500K+", "Bemorlar qamrovi"],
    ["98%", "AI ishonchlilik (AUC)"],
    ["2 daq", "Rentgen tahlili (7 kun o'rniga)"],
  ]
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map(([v, l], i) => (
          <Reveal key={l} delay={i * 80} className="px-4 py-8 text-center">
            <p className="text-3xl font-semibold tabular-nums text-gradient sm:text-4xl">{v}</p>
            <p className="mt-1 text-sm text-muted-foreground">{l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ── Workflow pipeline ────────────────────────────────────────────────────────
const STEPS = [
  { icon: Upload, title: "Rentgen yuklash", desc: "Bemor yoki shifokor DICOM/PNG rasmni yuklaydi.", color: "text-primary bg-primary/10" },
  { icon: BrainCircuit, title: "AI tahlil (~2 daq)", desc: "DenseNet-121 multi-label ehtimollik + Grad-CAM issiqlik xaritasi.", color: "text-chart-3 bg-chart-3/10" },
  { icon: UserCheck, title: "Radiolog tasdig'i", desc: "Human-in-the-loop: tasdiq, to'g'rilash yoki rad etish.", color: "text-chart-4 bg-chart-4/10" },
  { icon: Share2, title: "Yo'naltirish", desc: "Tashxisga qarab mutaxassis tanlanadi va Telegram xabar tayyorlanadi.", color: "text-emerald bg-emerald/10" },
]

export function Workflow() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Ish oqimi</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Yuklashdan yo'naltirishgacha — bitta oqim
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          AI mustaqil tashxis qo'ymaydi. Har bir natija litsenziyalangan radiolog tomonidan tasdiqlanadi.
        </p>
      </Reveal>

      <div className="relative mt-14 grid gap-6 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 120} className="relative">
            <div className="glass rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className={`grid size-12 place-items-center rounded-xl ${s.color}`}>
                <s.icon className="size-6" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <h3 className="font-semibold">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

// ── Feature grid ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BrainCircuit, title: "Multi-label AI", desc: "14 ta ko'krak patologiyasi bo'yicha alohida ehtimollik: pnevmoniya, sil, kardiomegaliya va h.k." },
  { icon: Activity, title: "Grad-CAM lokalizatsiya", desc: "Issiqlik xaritasi 'nima asosida' degan savolga javob beradi — shaffof AI." },
  { icon: ShieldCheck, title: "Human-in-the-Loop", desc: "Shoshilinch/noaniq holatlar majburan radiolog tasdig'iga boradi." },
  { icon: Bot, title: "Telegram integratsiya", desc: "Eslatma, natija va patronaj xabarlari avtomatik yuboriladi." },
  { icon: LineChart, title: "Menejer analitikasi", desc: "Daromad, no-show, baho va AI hajm ko'rsatkichlari bitta panelda." },
  { icon: Stethoscope, title: "Aqlli yo'naltirish", desc: "Tashxis avtomatik to'g'ri mutaxassislikka biriktiriladi (SLA taymer bilan)." },
]

export function Features() {
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Imkoniyatlar</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Klinikaning kelajagi uchun qurilgan platforma
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="group glass h-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Specialist routing matrix ────────────────────────────────────────────────
const ROUTES = [
  { icon: HeartPulse, findings: "Pnevmoniya · Sil · COVID-19", to: "Pulmonolog (O'pka shifokori)", color: "text-primary" },
  { icon: Activity, findings: "Kardiomegaliya", to: "Kardiolog", color: "text-chart-4" },
  { icon: Bone, findings: "Sinish · Suyak anomaliyalari", to: "Ortoped-Travmatolog", color: "text-chart-3" },
  { icon: Microscope, findings: "Tugun · Massa · O'sma", to: "Onkolog / Torakal jarroh", color: "text-destructive" },
  { icon: ShieldCheck, findings: "Norma (patologiyasiz)", to: "Umumiy amaliyot / Patronaj", color: "text-emerald" },
]

export function RoutingMatrix() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Yo'naltirish matritsasi</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Tasdiqlangan tashxis — to'g'ri mutaxassisga
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Radiolog tasdig'idan so'ng aqlli yo'naltirish algoritmi topilmani mos mutaxassislikka
            bog'laydi va Telegram bot uchun avtomatik xabar payloadini tayyorlaydi.
          </p>
          <Link
            href="/radiologist"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Yo'naltirishni jonli ko'rish <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <div className="space-y-3">
          {ROUTES.map((r, i) => (
            <Reveal key={r.to} delay={i * 90}>
              <div className="glass flex items-center gap-4 rounded-2xl p-4 transition-transform hover:translate-x-1">
                <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-card ${r.color}`}>
                  <r.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-muted-foreground">{r.findings}</p>
                </div>
                <span aria-hidden className="text-muted-foreground">→</span>
                <p className="shrink-0 text-right text-sm font-semibold">{r.to}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  ["AI mustaqil tashxis qo'yadimi?", "Yo'q. Avicenna AI — triaj yordamchisi. Har bir natija litsenziyalangan radiolog/shifokor tomonidan tasdiqlanadi."],
  ["Qaysi datasetlar ishlatilgan?", "NIH ChestX-ray14 (~112k rasm, 14 patologiya) va CheXpert (~224k rasm). MVP faqat ko'krak rentgeni bilan cheklangan."],
  ["Suyak sinishini aniqlaydimi?", "Ko'krak datasetida yo'q. Muskul-skelet uchun MURA dataseti 2-bosqichda qo'shiladi."],
  ["Ma'lumotlar qanday himoyalanadi?", "Rentgen rasmlari shifrlanadi (at-rest + in-transit), bemor roziligi olinadi, ma'lumot anonimlashtiriladi."],
]

export function Faq() {
  return (
    <section className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">Ko'p beriladigan savollar</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 70}>
              <details className="group glass rounded-2xl p-5 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between font-medium">
                  {q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA + Footer ─────────────────────────────────────────────────────────────
export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-emerald/10 p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Rentgeningizni hoziroq tahlil qiling
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Ro'yxatdan o'tish shart emas — demo rejimida rasm yuklang va AI + radiolog oqimini sinab ko'ring.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/analyze" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]">
              AI Rentgenni ochish
            </Link>
            <Link href="/radiologist" className="rounded-xl border border-border bg-card/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-accent">
              Radiolog navbati
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            Avicenna ⚕️ — Klinika OS + AI Radiolog · AI Hackaton Jizzax 2026
          </p>
          <p className="text-xs text-muted-foreground">
            AI yordamchi triaj vositasi. Yakuniy qaror davolovchi shifokorda.
          </p>
        </div>
      </footer>
    </>
  )
}
