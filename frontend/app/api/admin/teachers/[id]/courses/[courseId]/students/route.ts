import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; courseId: string }> }) {
  const { courseId } = await params
  return forwardToBackend({
    service: "course",
    path: `/admin/courses/${encodeURIComponent(courseId)}/students/grades`,
    requireRole: "Admin",
    error: { fallback: "Failed to fetch course students" },
    action: "fetching course students",
  })
}
