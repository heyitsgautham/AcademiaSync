import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return forwardToBackend({
    service: "course",
    path: `/admin/teachers/${encodeURIComponent(id)}/courses`,
    requireRole: "Admin",
    error: { fallback: "Failed to fetch teacher courses" },
    action: "fetching teacher courses",
  })
}
