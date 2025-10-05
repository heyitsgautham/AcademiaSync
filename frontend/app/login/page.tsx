"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  // Check for error from NextAuth redirect
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      if (errorParam === "AccessDenied") {
        setError("🐼 Whoa there, eager beaver! You've tried logging in too many times. Take a breather and try again in 10 minutes! ☕")
        setRetryAfter(600)
      } else {
        setError("Authentication failed. Please try again.")
      }
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    setRetryAfter(null)

    try {
      const result = await signIn("google", {
        callbackUrl: "/auth/callback",
        redirect: true,
      })

      // If signIn doesn't redirect, there might be an error
      if (result?.error) {
        setError("Login failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Check if it's a rate limit error
      if (error?.status === 429 || error?.response?.status === 429) {
        const errorData = error?.response?.data || error?.data
        setError(errorData?.message || "🐼 Whoa there, eager beaver! You've tried logging in too many times. Take a breather and try again in 10 minutes! ☕")
        setRetryAfter(errorData?.retryAfter || 600)
      } else {
        setError("An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Rate Limit Error Display - Above AcademiaSync Logo */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <div className="text-6xl mb-4">🐼</div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-destructive mb-2">Too Many Logins!</h2>
              <p className="text-destructive text-lg leading-relaxed">
                {error}
              </p>
              {retryAfter && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Please wait {Math.ceil(retryAfter / 60)} minutes before trying again.
                </p>
              )}
            </div>
          </motion.div>
        )}

        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-foreground">AcademiaSync</span>
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Login to AcademiaSync to continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 text-base bg-card hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-gray-900 dark:hover:border-white transition-colors cursor-pointer"
              size="lg"
              disabled={isLoading || !!retryAfter}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
