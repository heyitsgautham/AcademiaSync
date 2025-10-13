import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    const authHeader = `Bearer ${(session as any).backendAccessToken}`

    // Prepare notification preferences payload
    // Note: This assumes the user profile endpoint accepts notification fields
    // If a dedicated notifications endpoint exists in the backend, use that instead
    const updatePayload = {
      email_notifications: data.emailNotifications,
      assignment_reminders: data.assignmentReminders,
      grade_notifications: data.gradeNotifications,
      course_updates: data.courseUpdates,
    }

    // Update notification preferences via user profile endpoint
    // If a dedicated /api/users/notifications endpoint is created later, use that
    const response = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(updatePayload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update notifications" }))
      return NextResponse.json(
        { error: error.message || "Failed to update notifications" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}
