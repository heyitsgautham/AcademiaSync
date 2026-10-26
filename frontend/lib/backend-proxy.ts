import { NextResponse } from "next/server"
import { getServerSession, type Session } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Shared plumbing for the /api route handlers, which forward the signed-in user's
 * request to user-service or course-service with their backend access token.
 */

export type BackendService = "user" | "course"

export const backendUrl = (service: BackendService): string =>
  service === "user"
    ? process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"
    : process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

type JsonObject = Record<string, unknown>

/**
 * How a failed backend response reaches the browser.
 * Without it the backend's body passes through unchanged.
 * With it the body becomes `{ error }`, taken from the backend's `from` field, or `fallback`.
 */
export interface ErrorShape {
  fallback: string
  /** Backend field holding the message; "none" always uses the fallback */
  from?: "error" | "message" | "none"
}

export interface ForwardOptions {
  service: BackendService
  /** Path on the service, starting with a slash */
  path: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  /** Query parameters, encoded onto the path; null and undefined values are left out */
  query?: Record<string, string | number | null | undefined>
  /** JSON body to send */
  body?: unknown
  /** Role the session must hold, compared case-sensitively with session.user.role */
  requireRole?: string
  error?: ErrorShape
  /** Status for a successful response, 200 by default */
  successStatus?: number
  /** What the handler was doing, for the server log */
  action: string
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 })

/** The session's backend token, or null when the user is not signed in to the backends. */
export async function backendSession(): Promise<(Session & { backendAccessToken: string }) | null> {
  const session = await getServerSession(authOptions)
  if (!session?.backendAccessToken) return null
  return session as Session & { backendAccessToken: string }
}

/** Reads a response body as JSON, falling back to `{ error: <text> }` for anything else. */
async function readBody(response: Response): Promise<JsonObject> {
  const text = await response.text()
  if (!text) return {}
  try {
    const parsed: unknown = JSON.parse(text)
    return parsed !== null && typeof parsed === "object" ? (parsed as JsonObject) : { error: text }
  } catch {
    return { error: text }
  }
}

function errorBody(body: JsonObject, shape?: ErrorShape): JsonObject {
  if (!shape) return body
  const from = shape.from ?? "error"
  const message = from === "none" ? undefined : body[from]
  return { error: typeof message === "string" && message ? message : shape.fallback }
}

export function buildPath(path: string, query?: ForwardOptions["query"]): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) params.append(key, String(value))
  }
  const encoded = params.toString()
  return encoded ? `${path}?${encoded}` : path
}

/**
 * Forwards one request to a backend as the signed-in user.
 * Answers 401 without a backend session, 403 when `requireRole` does not match,
 * the backend's status and body otherwise, and 500 when the backend cannot be reached.
 */
export async function forwardToBackend(options: ForwardOptions): Promise<NextResponse> {
  try {
    const session = await backendSession()
    if (!session) return unauthorized()

    if (options.requireRole && session.user?.role !== options.requireRole) {
      return NextResponse.json({ error: `Forbidden - ${options.requireRole} access required` }, { status: 403 })
    }

    const headers: Record<string, string> = { Authorization: `Bearer ${session.backendAccessToken}` }
    const init: RequestInit = { method: options.method ?? "GET", headers }
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json"
      init.body = JSON.stringify(options.body)
    }

    const response = await fetch(`${backendUrl(options.service)}${buildPath(options.path, options.query)}`, init)
    const body = await readBody(response)

    if (!response.ok) {
      return NextResponse.json(errorBody(body, options.error), { status: response.status })
    }
    return NextResponse.json(body, { status: options.successStatus ?? 200 })
  } catch (error) {
    console.error(`Error ${options.action}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Parses a request's JSON body, or returns null when it is missing or malformed. */
export async function readJson<T = JsonObject>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

/** 400 for a request whose body is not JSON. */
export const invalidJson = () => NextResponse.json({ error: "Request body must be JSON" }, { status: 400 })
