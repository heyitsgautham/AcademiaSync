import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("[Available Courses API] Session exists:", !!session)
    console.log("[Available Courses API] Has backend token:", !!(session as any)?.backendAccessToken)

    if (!session || !(session as any).backendAccessToken) {
      console.log("[Available Courses API] Unauthorized - no session or token")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Available Courses API] Fetching from:", `${COURSE_SERVICE_URL}/api/student/available-courses`)
    const response = await fetch(`${COURSE_SERVICE_URL}/api/student/available-courses`, {
      headers: {
        'Authorization': `Bearer ${(session as any).backendAccessToken}`,
      },
    })

    console.log("[Available Courses API] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Available Courses API] Error response:", errorText)
      try {
        const error = JSON.parse(errorText)
        return NextResponse.json(error, { status: response.status })
      } catch {
        return NextResponse.json({ error: errorText }, { status: response.status })
      }
    }

    const data = await response.json()
    console.log("[Available Courses API] Success - courses count:", data.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Available Courses API] Exception:", error)
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
