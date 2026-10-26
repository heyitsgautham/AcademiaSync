import { afterEach, describe, expect, it, vi } from "vitest"
import { fetchJson, HttpError, shouldRetry } from "@/lib/http"

describe("fetchJson", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("returns the parsed body on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 })))
    await expect(fetchJson("/api/x", "Failed")).resolves.toEqual({ id: 1 })
  })

  it("throws an HttpError with the status and the caller's message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })))
    const error = await fetchJson("/api/x", "Failed to fetch course data").catch((e: unknown) => e)
    expect(error).toBeInstanceOf(HttpError)
    expect(error).toMatchObject({ status: 404, message: "Failed to fetch course data", isClientError: true })
  })
})

describe("shouldRetry", () => {
  it("never retries a 4xx", () => {
    expect(shouldRetry(0, new HttpError(404, "missing"))).toBe(false)
    expect(shouldRetry(0, new HttpError(403, "forbidden"))).toBe(false)
  })

  it("retries server errors and network failures three times", () => {
    expect(shouldRetry(0, new HttpError(503, "down"))).toBe(true)
    expect(shouldRetry(2, new TypeError("fetch failed"))).toBe(true)
    expect(shouldRetry(3, new TypeError("fetch failed"))).toBe(false)
  })
})
