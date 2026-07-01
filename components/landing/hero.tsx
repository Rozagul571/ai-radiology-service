import Link from "next/link"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { XrayScanner } from "@/components/xray-scanner"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute -top-40 left-1/4 size-[36rem] rounded-full bg-primary/20 blur-[120px] animate-float-slow" />
        <div className="absolute -top-20 right-1/4 size-[30rem] rounded-full bg-emerald/20 blur-[120px] animate-float" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            AI Hackaton · Jizzax 2026 · MVP
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Klinikalar uchun <span className="text-gradient">AI Radiolog</span> va Sog'liqni saqlash OS
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Avicenna bemorlar, shifokorlar, radiologlar va sun'iy intellektni yagona
            ekotizimga bog'laydi. Ko'krak rentgeni <span className="font-medium text-foreground">2 daqiqada</span> tahlil
            qilinadi, radiolog tomonidan tasdiqlanadi va bemor to'g'ri mutaxassisga yo'naltiriladi.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/analyze"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
            >
              Rentgenni bepul tahlil qilish
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/radiologist"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-accent"
            >
              <Play className="size-4 text-emerald" />
              Radiolog panelini ko'rish
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {[
              ["Ishonchlilik", "98%"],
              ["AI tahlil", "~2 daq"],
              ["Klinikalar", "200+"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <XrayScanner />
        </div>
      </div>
    </section>
  )
}
