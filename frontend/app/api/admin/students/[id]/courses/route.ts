import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend({
    service: "course",
    path: `/admin/students/${encodeURIComponent(params.id)}/courses`,
    requireRole: "Admin",
    error: { fallback: "Failed to fetch student courses" },
    action: "fetching student courses",
  })
}
