import { afterEach, describe, expect, it, vi } from "vitest"

const load = async () => {
  vi.resetModules()
  return import("@/app/api/admin/analytics/validate/route")
}

const check = (key?: string) => new Request(`http://localhost/api/admin/analytics/validate${key === undefined ? "" : `?apiKey=${key}`}`)

describe("GET /api/admin/analytics/validate", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("accepts the configured key", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "right-key")
    const res = await (await load()).GET(check("right-key"))
    expect([res.status, await res.json()]).toEqual([200, { valid: true, message: "API key is valid" }])
  })

  it("rejects a wrong or missing key", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "right-key")
    const { GET } = await load()
    expect((await GET(check("wrong-key"))).status).toBe(401)
    expect((await GET(check())).status).toBe(401)
  })

  it("answers 503 when no key is configured", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "")
    const res = await (await load()).GET(check("anything"))
    expect(res.status).toBe(503)
  })
})
