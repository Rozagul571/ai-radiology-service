import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/landing/hero"
import {
  StatsBand,
  Workflow,
  Features,
  RoutingMatrix,
  Faq,
  CtaFooter,
} from "@/components/landing/sections"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteNav />
      <Hero />
      <StatsBand />
      <Workflow />
      <Features />
      <RoutingMatrix />
      <Faq />
      <CtaFooter />
    </main>
  )
}
