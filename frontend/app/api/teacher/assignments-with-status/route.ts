import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const COURSE_SERVICE_URL =
      process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

    const url = new URL(
      `${COURSE_SERVICE_URL}/api/teacher/assignments-with-status`
    )
    if (status) {
      url.searchParams.append("status", status)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${session.backendAccessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch assignments" },
        { status: response.status }
      )
    }

    const assignments = await response.json()
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments with status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
