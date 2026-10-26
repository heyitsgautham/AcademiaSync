/** A failed response from one of the app's own /api routes, with its status. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "HttpError"
  }

  /** 4xx: the request itself was wrong, so sending it again cannot help. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }
}

/** GETs JSON from a same-origin route, throwing an HttpError with `failureMessage` on a non-2xx status. */
export async function fetchJson<T>(url: string, failureMessage: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new HttpError(res.status, failureMessage)
  return (await res.json()) as T
}

const MAX_RETRIES = 3

/**
 * React Query retry policy: retry network failures and 5xx up to three times, but never a 4xx.
 * A missing record answers 404, and retrying it only kept the page on skeletons for about seven seconds.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.isClientError) return false
  return failureCount < MAX_RETRIES
}
