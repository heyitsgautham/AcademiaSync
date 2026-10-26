import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/teacher/analytics",
    error: { fallback: "Failed to fetch analytics" },
    action: "fetching teacher analytics",
  })
}
