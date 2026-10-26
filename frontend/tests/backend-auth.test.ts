import { describe, expect, it, vi } from "vitest"
import { accessTokenFromSetCookie, exchangeGoogleToken } from "@/lib/backend-auth"

const user = { id: 7, email: "a@example.com", firstName: "Ana", lastName: null, profilePicture: null, role: "Student" }

const respond = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers }))

describe("exchangeGoogleToken", () => {
  it("returns the user, role and access token cookie on success", async () => {
    const fetchImpl = respond(200, { user, role: "Student" }, { "set-cookie": "accessToken=abc.def.ghi; Path=/; HttpOnly" })

    const result = await exchangeGoogleToken("http://users:5000", "google-id-token", fetchImpl)

    expect(result).toEqual({ ok: true, user, role: "Student", accessToken: "abc.def.ghi" })
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://users:5000/auth/google",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ idToken: "google-id-token" }) }),
    )
  })

  it("reports a 429 from the sign-in rate limiter as rate-limited", async () => {
    const result = await exchangeGoogleToken("http://users:5000", "t", respond(429, { error: "Too Many Requests" }))
    expect(result).toEqual({ ok: false, reason: "rate-limited", status: 429 })
  })

  it("reports a refused Google token as rejected", async () => {
    const result = await exchangeGoogleToken("http://users:5000", "t", respond(401, { error: "Unauthorized" }))
    expect(result).toEqual({ ok: false, reason: "rejected", status: 401 })
  })

  it("reports a server error or a network failure as unreachable", async () => {
    expect(await exchangeGoogleToken("http://users:5000", "t", respond(503, {}))).toMatchObject({ ok: false, reason: "unreachable" })
    const down = vi.fn().mockRejectedValue(new TypeError("fetch failed"))
    expect(await exchangeGoogleToken("http://users:5000", "t", down)).toEqual({ ok: false, reason: "unreachable" })
  })
})

describe("accessTokenFromSetCookie", () => {
  it("finds the access token among several cookies", () => {
    expect(accessTokenFromSetCookie("refreshToken=r1; HttpOnly, accessToken=a1; Path=/")).toBe("a1")
  })

  it("returns null without the cookie", () => {
    expect(accessTokenFromSetCookie(null)).toBeNull()
    expect(accessTokenFromSetCookie("refreshToken=r1")).toBeNull()
  })
})
