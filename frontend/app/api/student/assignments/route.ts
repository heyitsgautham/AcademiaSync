import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001";

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${COURSE_SERVICE_URL}/api/student/assignments`, {
      headers: {
        'Authorization': `Bearer ${(session as any).backendAccessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
