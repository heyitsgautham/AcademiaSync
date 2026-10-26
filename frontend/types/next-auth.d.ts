import "next-auth"
import "next-auth/jwt"
import type { BackendUser } from "@/lib/backend-auth"

declare module "next-auth" {
  /**
   * The session the app reads: the user, their role, and the user-service access token
   * that the /api route handlers forward to the backends.
   */
  interface Session {
    user: {
      id: number | string
      email: string
      firstName?: string
      lastName?: string | null
      name?: string | null
      image?: string | null
      role?: string
      profilePicture?: string | null
      first_name?: string
      last_name?: string | null
      age?: number | null
      specialization?: string | null
    }
    role: string
    backendAccessToken?: string | null
  }

  interface User {
    id: string
    email: string
    firstName?: string
    lastName?: string
    name?: string | null
    image?: string | null
    role?: string
  }
}

declare module "next-auth/jwt" {
  /** What the jwt callback stores after a successful sign-in. */
  interface JWT {
    user?: BackendUser
    role?: string
    backendAccessToken?: string | null
  }
}
