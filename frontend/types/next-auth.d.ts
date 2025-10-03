import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extends the built-in session types to include custom fields
   */
  interface Session {
    user: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      name?: string | null
      image?: string | null
    }
    role: string
    accessToken?: string
    refreshToken?: string
    backendAccessToken?: string
  }

  /**
   * Extends the built-in user types to include custom fields
   */
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
  /**
   * Extends the built-in JWT types to include custom fields
   */
  interface JWT {
    user?: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      name?: string | null
      image?: string | null
    }
    role?: string
    accessToken?: string
    refreshToken?: string
  }
}
