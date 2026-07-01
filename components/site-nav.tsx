"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Moon, Sun, Menu, X } from "lucide-react"
import { Logo } from "./logo"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/analyze", label: "AI Rentgen" },
  { href: "/radiologist", label: "Radiolog paneli" },
]

export function SiteNav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Avicenna bosh sahifa">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Mavzuni almashtirish"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link
            href="/analyze"
            className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Rentgen yuklash
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menyu"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                pathname === l.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
