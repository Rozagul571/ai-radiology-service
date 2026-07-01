import { type NextRequest, NextResponse } from "next/server"
import { validateCase } from "@/lib/store"

// POST /api/validate/:id — submit human validation (APPROVED | MODIFIED | REJECTED),
// applies the specialist routing matrix, and builds the referral + Telegram payload.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)

  const status = body?.status
  if (!["APPROVED", "MODIFIED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 })
  }

  const updated = validateCase(id, {
    reviewerId: String(body.reviewerId || "RAD-01"),
    reviewerName: String(body.reviewerName || "Dr. Radiolog"),
    status,
    notes: String(body.notes || ""),
    confirmedCode: body.confirmedCode ? String(body.confirmedCode) : undefined,
  })

  if (!updated) {
    return NextResponse.json({ error: "Holat topilmadi" }, { status: 404 })
  }

  return NextResponse.json({ case: updated })
}
