import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

vi.mock("next-auth", () => ({ getServerSession: vi.fn().mockResolvedValue(null) }))
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }))
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))

import DebugPage from "@/app/debug-auth/page"

describe("/debug-auth", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("serves a 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production")
    await expect(DebugPage()).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("renders in production only when NEXTAUTH_DEBUG is true", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("NEXTAUTH_DEBUG", "true")
    vi.stubEnv("NEXTAUTH_URL", "https://lms.example.com")

    render(await DebugPage())

    expect(screen.getByText("NextAuth Debug Page")).toBeInTheDocument()
    expect(screen.getByText("https://lms.example.com/api/auth/callback/google")).toBeInTheDocument()
  })

  it("reports whether the Google secret is set without printing it", async () => {
    vi.stubEnv("NODE_ENV", "development")
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "super-secret-value")

    const { container } = render(await DebugPage())

    expect(container.textContent).not.toContain("super-secret-value")
  })
})
