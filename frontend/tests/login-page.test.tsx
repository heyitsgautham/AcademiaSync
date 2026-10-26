import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

let errorParam: string | null = null

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(errorParam ? { error: errorParam } : {}),
}))
vi.mock("next-auth/react", () => ({ signIn: vi.fn() }))

import LoginPage from "@/app/login/page"

describe("/login", () => {
  it("explains a rate-limited sign-in", () => {
    errorParam = "RateLimited"
    render(<LoginPage />)
    expect(screen.getByText(/Too many failed sign-in attempts/)).toBeInTheDocument()
  })

  it("explains a refused Google account", () => {
    errorParam = "AccessDenied"
    render(<LoginPage />)
    expect(screen.getByText(/could not sign you in with that Google account/)).toBeInTheDocument()
  })

  it("falls back to a generic message for other codes", () => {
    errorParam = "OAuthCallback"
    render(<LoginPage />)
    expect(screen.getByText("Authentication failed. Please try again.")).toBeInTheDocument()
  })

  it("shows no error without a code", () => {
    errorParam = null
    render(<LoginPage />)
    expect(screen.queryByText("Authentication Error")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Continue with Google/ })).toBeInTheDocument()
  })
})
