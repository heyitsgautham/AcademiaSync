import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getServerSession = vi.fn()
vi.mock("next-auth", () => ({ getServerSession: (...args: unknown[]) => getServerSession(...args) }))
vi.mock("@/lib/auth", () => ({ authOptions: {} }))

import { buildPath, forwardToBackend } from "@/lib/backend-proxy"

const signedIn = (role = "Admin") => ({ backendAccessToken: "tok-1", role, user: { id: 1, email: "a@example.com", role } })
const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })

describe("forwardToBackend", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubEnv("INTERNAL_BACKEND_URL", "http://users:5000")
    vi.stubEnv("INTERNAL_COURSE_SERVICE_URL", "http://courses:5001")
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    getServerSession.mockReset()
  })

  it("answers 401 without calling a backend when there is no backend session", async () => {
    getServerSession.mockResolvedValue({ user: { email: "a@example.com" } })

    const res = await forwardToBackend({ service: "user", path: "/admin/stats", action: "test" })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: "Unauthorized" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("answers 403 when the session lacks the required role", async () => {
    getServerSession.mockResolvedValue(signedIn("Teacher"))

    const res = await forwardToBackend({ service: "course", path: "/admin/courses", requireRole: "Admin", action: "test" })

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: "Forbidden - Admin access required" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("forwards method, JSON body and bearer token to the chosen service", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 5 }))

    const res = await forwardToBackend({
      service: "user",
      path: "/admin/teachers/5",
      method: "PUT",
      body: { first_name: "Tia" },
      action: "test",
    })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 5 })
    expect(fetchMock).toHaveBeenCalledWith("http://users:5000/admin/teachers/5", {
      method: "PUT",
      headers: { Authorization: "Bearer tok-1", "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: "Tia" }),
    })
  })

  it("encodes query values instead of pasting them into the URL", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValue(jsonResponse(200, []))

    await forwardToBackend({ service: "course", path: "/api/student/analytics", query: { filter: "weekly&admin=1" }, action: "test" })

    expect(fetchMock.mock.calls[0][0]).toBe("http://courses:5001/api/student/analytics?filter=weekly%26admin%3D1")
  })

  it("uses successStatus for a successful response", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 9 }))

    const res = await forwardToBackend({ service: "user", path: "/admin/teachers", method: "POST", body: {}, successStatus: 201, action: "test" })

    expect(res.status).toBe(201)
  })

  it("passes a backend error through unchanged by default", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValue(jsonResponse(409, { error: "Conflict", message: "Already enrolled" }))

    const res = await forwardToBackend({ service: "course", path: "/api/student/enroll", method: "POST", body: {}, action: "test" })

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: "Conflict", message: "Already enrolled" })
  })

  it("reshapes a backend error to { error } when an error shape is given", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValueOnce(jsonResponse(404, { error: "Teacher not found" }))
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { detail: "x" }))
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { message: "Bad age" }))

    const named = await forwardToBackend({ service: "user", path: "/a", error: { fallback: "Failed" }, action: "test" })
    const fallback = await forwardToBackend({ service: "user", path: "/a", error: { fallback: "Failed" }, action: "test" })
    const fromMessage = await forwardToBackend({ service: "user", path: "/a", error: { fallback: "Failed", from: "message" }, action: "test" })

    expect([named.status, await named.json()]).toEqual([404, { error: "Teacher not found" }])
    expect([fallback.status, await fallback.json()]).toEqual([500, { error: "Failed" }])
    expect([fromMessage.status, await fromMessage.json()]).toEqual([400, { error: "Bad age" }])
  })

  it("wraps a non-JSON error body instead of failing", async () => {
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockResolvedValue(new Response("Bad Gateway", { status: 502 }))

    const res = await forwardToBackend({ service: "course", path: "/x", action: "test" })

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: "Bad Gateway" })
  })

  it("answers 500 without leaking details when the backend is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    getServerSession.mockResolvedValue(signedIn())
    fetchMock.mockRejectedValue(new TypeError("connect ECONNREFUSED 10.0.0.5:5001"))

    const res = await forwardToBackend({ service: "course", path: "/x", action: "test" })

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: "Internal server error" })
  })
})

describe("buildPath", () => {
  it("leaves out empty query values", () => {
    expect(buildPath("/a", { status: undefined, page: null })).toBe("/a")
    expect(buildPath("/a", { status: "graded", page: 2 })).toBe("/a?status=graded&page=2")
  })
})
