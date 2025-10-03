import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const COURSE_SERVICE_URL =
      process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

    const response = await fetch(`${COURSE_SERVICE_URL}/api/teacher/stats`, {
      headers: {
        Authorization: `Bearer ${session.backendAccessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch stats" },
        { status: response.status }
      )
    }

    const stats = await response.json()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching teacher stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
