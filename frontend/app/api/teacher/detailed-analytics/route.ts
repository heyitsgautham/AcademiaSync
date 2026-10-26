import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/teacher/analytics/detailed",
    error: { fallback: "Failed to fetch detailed analytics", from: "none" },
    action: "fetching detailed analytics",
  })
}
