import { Account, AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { BackendUser, exchangeGoogleToken, SIGN_IN_ERROR_PARAM } from "@/lib/backend-auth";

/** The Google account NextAuth hands from signIn to jwt, carrying what user-service returned. */
type BackendAccount = Account & {
    userData: BackendUser
    userRole: string
    backendAccessToken: string | null
}

const isBackendAccount = (account: Account): account is BackendAccount =>
    "userData" in account && "userRole" in account

/** GET /api/users/profile on user-service. */
interface ProfileResponse {
    id: number
    email: string
    role: string
    first_name: string
    last_name: string | null
    age: number | null
    specialization: string | null
}

// Use Docker service name for server-side requests (NextAuth callbacks run on server)
// This is because the frontend container needs to communicate with user-service container
const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000";

// Determine if we're using HTTPS (for secure cookies)
// AWS ALB uses HTTP, GCP Cloud Run uses HTTPS
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') || false;

export const authOptions: AuthOptions = {
    // NextAuth debug output includes tokens, so it stays off in production builds.
    // Set NEXTAUTH_DEBUG=true to turn it on while troubleshooting a deployment.
    debug: process.env.NODE_ENV !== "production" || process.env.NEXTAUTH_DEBUG === "true",
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    useSecureCookies: useSecureCookies,
    cookies: {
        sessionToken: {
            name: useSecureCookies ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
        callbackUrl: {
            name: useSecureCookies ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
        csrfToken: {
            name: useSecureCookies ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: useSecureCookies,
            },
        },
    },
    callbacks: {
        async signIn({ account }: { account: Account | null }) {
            if (account?.provider !== "google" || !account.id_token) return true

            const result = await exchangeGoogleToken(BACKEND_URL, account.id_token)
            if (result.ok) {
                // NextAuth passes this same account object to the jwt callback next.
                const backendAccount = account as BackendAccount
                backendAccount.userData = result.user
                backendAccount.userRole = result.role
                backendAccount.backendAccessToken = result.accessToken
                return true
            }

            console.error(
                `[NextAuth] Sign-in with ${BACKEND_URL}/auth/google failed: ${result.reason}`,
                result.status ?? "",
            )
            // A URL sends the user back to the login page with a reason it can explain.
            return `/login?error=${SIGN_IN_ERROR_PARAM[result.reason]}`
        },
        async jwt({ token, account }: { token: JWT; account: Account | null }) {
            // Persist user data, role, and backend token to the JWT token
            if (account && isBackendAccount(account)) {
                token.user = account.userData
                token.role = account.userRole
                token.backendAccessToken = account.backendAccessToken
            }
            return token
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Add user data, role, and backend token to the session
            if (token.user) {
                session.user = { ...token.user }
                // Map profilePicture to image for NextAuth compatibility
                if (token.user.profilePicture) {
                    session.user.image = token.user.profilePicture
                }
            }
            if (token.role) {
                session.role = token.role
            }
            if (token.backendAccessToken) {
                session.backendAccessToken = token.backendAccessToken

                // Fetch fresh user data from backend to get updated profile info
                try {
                    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${token.backendAccessToken}`,
                        },
                    })

                    if (response.ok) {
                        const fresh = (await response.json()) as ProfileResponse
                        // Update session with fresh data, mapping snake_case to camelCase
                        session.user = {
                            ...session.user,
                            name: fresh.first_name && fresh.last_name
                                ? `${fresh.first_name} ${fresh.last_name}`
                                : fresh.first_name,
                            firstName: fresh.first_name,
                            lastName: fresh.last_name,
                            ...fresh,
                        }
                    }
                } catch (error) {
                    console.error("Error fetching fresh user data:", error)
                    // Continue with cached data if fetch fails
                }
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect errors back to login page
    },
    session: {
        strategy: "jwt" as const,
    },
    logger: {
        error(code, ...message) {
            console.error("[NextAuth Error]", code, message);
        },
        warn(code, ...message) {
            console.warn("[NextAuth Warn]", code, message);
        },
        debug(code, ...message) {
            console.log("[NextAuth Debug]", code, message);
        },
    },
};
