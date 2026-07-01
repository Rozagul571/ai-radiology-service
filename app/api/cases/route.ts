import { NextResponse } from "next/server"
import { listAll, stats } from "@/lib/store"

// GET /api/cases — full case list + aggregate stats.
export async function GET() {
  return NextResponse.json({ cases: listAll(), stats: stats() })
}
