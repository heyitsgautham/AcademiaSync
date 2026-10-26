/**
 * Messages for the ?error= codes that NextAuth and the signIn callback send to /login.
 * AccessDenied is NextAuth's code for a sign-in the callback refused.
 */
const MESSAGES: Record<string, string> = {
  RateLimited: "Too many failed sign-in attempts. Please wait a few minutes before trying again.",
  AccessDenied: "We could not sign you in with that Google account. Please try again.",
  ServiceUnavailable: "Sign-in is unavailable right now. Please try again in a few minutes.",
}

const FALLBACK = "Authentication failed. Please try again."

export function signInErrorMessage(code: string | null): string | null {
  if (!code) return null
  return MESSAGES[code] ?? FALLBACK
}
