import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { Account, Profile } from "next-auth";

// Use Docker service name for server-side requests (NextAuth callbacks run on server)
// This is because the frontend container needs to communicate with user-service container
const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000";

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false, // Set to true in production with HTTPS
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: false,
            },
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false,
            },
        },
    },
    callbacks: {
        async signIn({ account, profile }: { account: Account | null; profile?: Profile }) {
            if (account?.provider === "google" && account.id_token) {
                try {
                    // Send Google ID token to backend
                    const response = await fetch(`${BACKEND_URL}/auth/google`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            idToken: account.id_token,
                        }),
                        credentials: "include",
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Extract access token from Set-Cookie header
                        const setCookieHeader = response.headers.get('set-cookie');
                        let backendAccessToken = null;

                        if (setCookieHeader) {
                            const accessTokenMatch = setCookieHeader.match(/accessToken=([^;]+)/);
                            if (accessTokenMatch) {
                                backendAccessToken = accessTokenMatch[1];
                            }
                        }

                        // Store user data and backend token in account for use in jwt callback
                        (account as any).userData = data.user;
                        (account as any).userRole = data.role;
                        (account as any).backendAccessToken = backendAccessToken;
                        return true;
                    } else {
                        console.error("Backend authentication failed:", await response.text());
                    }
                } catch (error) {
                    console.error("Error authenticating with backend:", error);
                }
                return false;
            }
            return true;
        },
        async jwt({ token, account }: { token: JWT; account: Account | null }) {
            // Persist user data, role, and backend token to the JWT token
            if (account && 'userData' in account && 'userRole' in account) {
                token.user = (account as any).userData;
                token.role = (account as any).userRole;
                token.backendAccessToken = (account as any).backendAccessToken;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // Add user data, role, and backend token to the session
            if (token.user) {
                session.user = token.user;
                // Map profilePicture to image for NextAuth compatibility
                if ((token.user as any).profilePicture) {
                    (session.user as any).image = (token.user as any).profilePicture;
                }
            }
            if (token.role) {
                session.role = token.role;
            }
            if (token.backendAccessToken) {
                (session as any).backendAccessToken = token.backendAccessToken;

                // Fetch fresh user data from backend to get updated profile info
                try {
                    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${token.backendAccessToken}`,
                        },
                    });

                    if (response.ok) {
                        const freshUserData = await response.json();
                        // Update session with fresh data, mapping snake_case to camelCase
                        session.user = {
                            ...session.user,
                            name: freshUserData.first_name && freshUserData.last_name
                                ? `${freshUserData.first_name} ${freshUserData.last_name}`
                                : freshUserData.first_name,
                            firstName: freshUserData.first_name,
                            lastName: freshUserData.last_name,
                            ...freshUserData
                        };
                    }
                } catch (error) {
                    console.error("Error fetching fresh user data:", error);
                    // Continue with cached data if fetch fails
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
