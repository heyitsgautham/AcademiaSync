"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function DashboardLogo() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogoClick = () => {
    const role = session?.role?.toLowerCase()

    // Redirect based on user role
    switch (role) {
      case "teacher":
        router.push("/teacher/dashboard")
        break
      case "student":
        router.push("/student/dashboard")
        break
      case "admin":
        router.push("/admin/dashboard")
        break
      default:
        router.push("/")
    }
  }

  return (
    <button
      onClick={handleLogoClick}
      className="text-xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
      aria-label="Go to dashboard"
    >
      AcademiaSync
    </button>
  )
}
