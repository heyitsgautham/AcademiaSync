import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    const response = await fetch(`${COURSE_SERVICE_URL}/api/student/enroll`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${(session as any).backendAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
