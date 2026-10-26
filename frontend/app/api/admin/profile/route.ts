import { forwardToBackend, invalidJson, readJson } from "@/lib/backend-proxy"

export async function GET() {
  return forwardToBackend({
    service: "user",
    path: "/admin/profile",
    error: { fallback: "Failed to fetch profile" },
    action: "fetching admin profile",
  })
}

export async function PUT(request: Request) {
  const body = await readJson(request)
  if (!body) return invalidJson()
  return forwardToBackend({
    service: "user",
    path: "/admin/profile",
    method: "PUT",
    body,
    error: { fallback: "Failed to update profile" },
    action: "updating admin profile",
  })
}
