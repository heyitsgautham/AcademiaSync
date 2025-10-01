import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const authOptions = {
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
        async signIn({ account, profile }) {
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
                        // Store user data in account for use in jwt callback
                        account.userData = data.user;
                        account.userRole = data.role;
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
        async jwt({ token, account }) {
            // Persist user data and role to the token
            if (account?.userData) {
                token.user = account.userData;
                token.role = account.userRole;
            }
            return token;
        },
        async session({ session, token }) {
            // Add user data and role to the session
            if (token.user) {
                session.user = token.user;
                session.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
