import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function POST(request: Request, { params }: { params: { assignmentId: string } }) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "course",
    path: `/api/teacher/assignments/${encodeURIComponent(params.assignmentId)}/submissions/bulk-grade`,
    method: "POST",
    body,
    action: "bulk grading submissions",
  })
}
