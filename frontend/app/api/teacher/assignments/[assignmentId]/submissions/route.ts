import { forwardToBackend } from "@/lib/backend-proxy"

export async function GET(request: Request, { params }: { params: { assignmentId: string } }) {
  const { search } = new URL(request.url)
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/assignments/${encodeURIComponent(params.assignmentId)}/submissions${search}`,
    action: "fetching assignment submissions",
  })
}
