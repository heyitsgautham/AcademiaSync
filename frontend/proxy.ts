import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { roleRedirect } from "@/lib/role-routing"

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    const target = roleRedirect(token?.role as string | undefined, path)
    if (target) {
      return NextResponse.redirect(new URL(target, req.url))
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
