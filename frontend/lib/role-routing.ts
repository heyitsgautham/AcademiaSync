export type Role = "student" | "teacher" | "admin"

const ROLE_SECTIONS: Record<Role, RegExp> = {
  student: /^\/student(\/|$)/,
  teacher: /^\/teacher(\/|$)/,
  admin: /^\/admin(\/|$)/,
}

const isRole = (value: string | undefined): value is Role =>
  value !== undefined && Object.prototype.hasOwnProperty.call(ROLE_SECTIONS, value)

/**
 * Decides where a signed-in user should go when they open a role section.
 * Returns null when they may stay, or the path to redirect to.
 * A token without a known role goes back to /login instead of to a dashboard that does not exist.
 */
export function roleRedirect(rawRole: string | undefined, path: string): string | null {
  const role = rawRole?.toLowerCase()
  const section = (Object.keys(ROLE_SECTIONS) as Role[]).find((name) => ROLE_SECTIONS[name].test(path))

  if (!section) return null
  if (!isRole(role)) return "/login"
  if (role === section) return null
  return `/${role}/dashboard`
}
