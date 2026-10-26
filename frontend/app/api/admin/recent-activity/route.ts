import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/admin/recent-activity",
    error: { fallback: "Failed to fetch recent activity" },
    action: "fetching admin recent activity",
  })
}
