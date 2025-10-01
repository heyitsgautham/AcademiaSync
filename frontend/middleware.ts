import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Get the role from the token
    const role = token?.role?.toLowerCase()

    // Define role-based route access
    const roleRoutes = {
      student: /^\/student/,
      teacher: /^\/teacher/,
      admin: /^\/admin/,
    }

    // Check if user is trying to access a role-specific route
    for (const [routeRole, pattern] of Object.entries(roleRoutes)) {
      if (pattern.test(path)) {
        // If user's role doesn't match the route role, redirect to their dashboard
        if (role !== routeRole) {
          return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Protect all role-based routes
export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
}
