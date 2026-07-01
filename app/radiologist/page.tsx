import { SiteNav } from "@/components/site-nav"
import { QueueClient } from "@/components/radiologist/queue-client"

export const metadata = {
  title: "Radiolog Navbati — Avicenna ⚕️",
  description: "Human-in-the-Loop radiolog tekshiruv navbati. AI topilmalarini tasdiqlash, to'g'irlash yoki rad etish.",
}

export default function RadiologistPage() {
  return (
    <main className="min-h-screen">
      <SiteNav />
      <QueueClient />
    </main>
  )
}
