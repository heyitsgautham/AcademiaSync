import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "course",
    path: "/admin/courses",
    error: { fallback: "Failed to fetch courses" },
    action: "fetching admin courses",
  })
}
