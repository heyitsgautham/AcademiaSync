import { afterEach, describe, expect, it, vi } from "vitest"
import type { Account } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { authOptions } from "@/lib/auth"

const googleAccount = (): Account => ({
  provider: "google",
  type: "oauth",
  providerAccountId: "123",
  id_token: "google-id-token",
})

const signIn = (account: Account) =>
  // The callback only reads the account; NextAuth also passes user and profile.
  authOptions.callbacks!.signIn!({ account } as Parameters<NonNullable<NonNullable<typeof authOptions.callbacks>["signIn"]>>[0])

describe("NextAuth signIn callback", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("sends the user back to /login with RateLimited when user-service answers 429", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })))

    await expect(signIn(googleAccount())).resolves.toBe("/login?error=RateLimited")
  })

  it("sends the user back with AccessDenied when user-service refuses the token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })))

    await expect(signIn(googleAccount())).resolves.toBe("/login?error=AccessDenied")
  })

  it("keeps the backend user and token for the jwt callback on success", async () => {
    const user = { id: 3, email: "t@example.com", firstName: "Tia", lastName: "T", profilePicture: null, role: "Teacher" }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ user, role: "Teacher" }), {
          status: 200,
          headers: { "set-cookie": "accessToken=tok; Path=/" },
        }),
      ),
    )
    const account = googleAccount()

    await expect(signIn(account)).resolves.toBe(true)

    const token = await authOptions.callbacks!.jwt!({ token: {} as JWT, account } as Parameters<
      NonNullable<NonNullable<typeof authOptions.callbacks>["jwt"]>
    >[0])
    expect(token).toMatchObject({ user, role: "Teacher", backendAccessToken: "tok" })
  })
})
