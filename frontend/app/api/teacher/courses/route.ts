import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${COURSE_SERVICE_URL}/api/teacher/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${(session as any).backendAccessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`)
    }

    const courses = await response.json()
    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching courses:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
