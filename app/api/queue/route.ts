import { NextResponse } from "next/server"
import { listQueue, stats } from "@/lib/store"

// GET /api/queue — cases pending human radiologist review, ordered by risk priority.
export async function GET() {
  return NextResponse.json({ queue: listQueue(), stats: stats() })
}
