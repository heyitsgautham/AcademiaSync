import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authHeader = `Bearer ${(session as any).backendAccessToken}`

    // Fetch user profile from user service
    const profileResponse = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    })

    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch profile: ${profileResponse.statusText}`)
    }

    const profile = await profileResponse.json()

    // Format the data to match the expected structure
    const data = {
      student: {
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
      },
      notifications: {
        emailNotifications: profile.email_notifications !== false,
        assignmentReminders: profile.assignment_reminders !== false,
        gradeNotifications: profile.grade_notifications !== false,
        courseUpdates: profile.course_updates === true,
      },
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
