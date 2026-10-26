import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function POST(request: Request) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "user",
    path: "/admin/promote-role",
    method: "POST",
    body,
    error: { fallback: "Failed to promote user" },
    action: "promoting user",
  })
}
