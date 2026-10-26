import { NextResponse } from "next/server"
import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  const apiKey = process.env.ANALYTICS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Analytics API key is not configured" }, { status: 503 })
  }
  return forwardToBackend({
    service: "user",
    path: "/admin/analytics",
    query: { apiKey },
    error: { fallback: "Failed to fetch analytics" },
    action: "fetching admin analytics",
  })
}
