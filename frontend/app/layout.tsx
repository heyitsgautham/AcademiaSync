import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/auth-provider"
import { QueryProvider } from "@/components/query-provider"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "AcademiaSync",
  description: "Created with AcademiaSync",
  generator: "AcademiaSync",
  referrer: "no-referrer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
