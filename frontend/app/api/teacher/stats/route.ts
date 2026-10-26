import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/api/teacher/stats",
    error: { fallback: "Failed to fetch stats" },
    action: "fetching teacher stats",
  })
}
