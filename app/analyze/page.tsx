import { SiteNav } from "@/components/site-nav"
import { AnalyzeClient } from "@/components/analyze/analyze-client"

export const metadata = {
  title: "AI Rentgen Tahlili — Avicenna ⚕️",
  description: "Ko'krak qafasi rentgenini yuklang. AI ~2 daqiqada multi-label tahlil beradi va radiolog navbatiga yo'naltiradi.",
}

export default function AnalyzePage() {
  return (
    <main className="min-h-screen">
      <SiteNav />
      <AnalyzeClient />
    </main>
  )
}
