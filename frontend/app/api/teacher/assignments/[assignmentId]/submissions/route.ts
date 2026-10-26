import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  const { search } = new URL(request.url)
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/assignments/${encodeURIComponent(assignmentId)}/submissions${search}`,
    action: "fetching assignment submissions",
  })
}
