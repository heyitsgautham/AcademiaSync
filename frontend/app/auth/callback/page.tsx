"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function AuthCallback() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated" && session?.role) {
            // Redirect based on role
            const role = session.role.toLowerCase()
            switch (role) {
                case "student":
                    router.push("/student/dashboard")
                    break
                case "teacher":
                    router.push("/teacher/dashboard")
                    break
                case "admin":
                    router.push("/admin/dashboard")
                    break
                default:
                    router.push("/")
            }
        } else if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, session, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Redirecting...</h2>
                <p className="text-muted-foreground">Please wait while we redirect you.</p>
            </div>
        </div>
    )
}
