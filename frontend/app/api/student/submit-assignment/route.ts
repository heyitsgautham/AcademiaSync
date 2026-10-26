import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

interface SubmitBody {
  assignmentId?: unknown
  submission?: unknown
  fileName?: unknown
}

export async function POST(request: Request) {
  const body = await readJson<SubmitBody>(request)
  if (!body) return invalidJson()
  const { assignmentId, submission, fileName } = body
  return forwardToBackend({
    service: "course",
    path: "/api/student/submit-assignment",
    method: "POST",
    body: { assignmentId, submission, fileName },
    action: "submitting assignment",
  })
}
