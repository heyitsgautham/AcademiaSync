/**
 * Exchanges the Google ID token NextAuth received for user-service's own session.
 * Kept out of the NextAuth callbacks so each outcome can be tested without a sign-in flow.
 */

/** The user record POST /auth/google returns. */
export interface BackendUser {
  id: number
  email: string
  firstName: string
  lastName: string | null
  profilePicture: string | null
  role: string
}

export type SignInFailure = "rate-limited" | "rejected" | "unreachable"

export type GoogleExchangeResult =
  | { ok: true; user: BackendUser; role: string; accessToken: string | null }
  | { ok: false; reason: SignInFailure; status?: number }

/** Login page error codes, passed as ?error= when sign-in fails. */
export const SIGN_IN_ERROR_PARAM: Record<SignInFailure, string> = {
  "rate-limited": "RateLimited",
  rejected: "AccessDenied",
  unreachable: "ServiceUnavailable",
}

/** Pulls the accessToken cookie value out of a Set-Cookie header. */
export function accessTokenFromSetCookie(header: string | null): string | null {
  const match = header?.match(/accessToken=([^;]+)/)
  return match ? match[1] : null
}

export async function exchangeGoogleToken(
  backendUrl: string,
  idToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GoogleExchangeResult> {
  let response: Response
  try {
    response = await fetchImpl(`${backendUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })
  } catch {
    return { ok: false, reason: "unreachable" }
  }

  if (response.status === 429) return { ok: false, reason: "rate-limited", status: 429 }
  if (!response.ok) {
    return { ok: false, reason: response.status >= 500 ? "unreachable" : "rejected", status: response.status }
  }

  const data = (await response.json()) as { user: BackendUser; role: string }
  return {
    ok: true,
    user: data.user,
    role: data.role,
    accessToken: accessTokenFromSetCookie(response.headers.get("set-cookie")),
  }
}
