import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function POST(request: Request, { params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/assignments/${encodeURIComponent(assignmentId)}/submissions/bulk-grade`,
    method: "POST",
    body,
    action: "bulk grading submissions",
  })
}
