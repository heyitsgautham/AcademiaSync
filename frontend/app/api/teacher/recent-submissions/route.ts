import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.backendAccessToken) {
      console.error("No backend access token found in session")
      // Return empty array instead of error to prevent frontend crash
      return NextResponse.json([])
    }

    const COURSE_SERVICE_URL =
      process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

    const response = await fetch(`${COURSE_SERVICE_URL}/api/teacher/recent-submissions?limit=5`, {
      headers: {
        Authorization: `Bearer ${session.backendAccessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Failed to fetch recent submissions:", errorData)
      // Return empty array instead of error to prevent frontend crash
      return NextResponse.json([])
    }

    const submissions = await response.json()
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching recent submissions:", error)
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json([])
  }
}
