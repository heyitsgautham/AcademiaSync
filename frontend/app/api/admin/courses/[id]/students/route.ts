import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend({
    service: "course",
    path: `/admin/courses/${encodeURIComponent(params.id)}/students/grades`,
    requireRole: "Admin",
    error: { fallback: "Failed to fetch course students" },
    action: "fetching course students",
  })
}
