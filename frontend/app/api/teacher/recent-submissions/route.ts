import { NextResponse } from "next/server"
import { backendSession, backendUrl } from "@/lib/backend-proxy"

// The dashboard widget treats any failure as "no recent submissions", so every error path returns [].
export async function GET() {
  try {
    const session = await backendSession()
    if (!session) {
      console.error("No backend access token found in session")
      return NextResponse.json([])
    }

    const response = await fetch(`${backendUrl("course")}/api/teacher/recent-submissions?limit=5`, {
      headers: { Authorization: `Bearer ${session.backendAccessToken}` },
    })

    if (!response.ok) {
      console.error("Failed to fetch recent submissions:", response.status)
      return NextResponse.json([])
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error("Error fetching recent submissions:", error)
    return NextResponse.json([])
  }
}
