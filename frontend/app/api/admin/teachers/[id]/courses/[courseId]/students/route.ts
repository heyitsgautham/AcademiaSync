import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: { id: string; courseId: string } }) {
  return forwardToBackend({
    service: "course",
    path: `/admin/courses/${encodeURIComponent(params.courseId)}/students/grades`,
    requireRole: "Admin",
    error: { fallback: "Failed to fetch course students" },
    action: "fetching course students",
  })
}
