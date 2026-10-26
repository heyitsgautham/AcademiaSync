import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function POST(request: Request) {
  const body = await readJson<{ courseId?: unknown }>(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "course",
    path: "/api/student/enroll",
    method: "POST",
    body: { courseId: body.courseId },
    action: "enrolling in course",
  })
}
