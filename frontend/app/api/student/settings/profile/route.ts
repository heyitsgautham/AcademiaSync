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

    // Extract name parts if provided as a single field
    let firstName = data.firstName || data.first_name
    let lastName = data.lastName || data.last_name

    if (data.name && !firstName && !lastName) {
      const nameParts = data.name.split(" ")
      firstName = nameParts[0] || ""
      lastName = nameParts.slice(1).join(" ") || ""
    }

    // Prepare update payload
    const updatePayload: any = {}
    if (firstName) updatePayload.first_name = firstName
    if (lastName) updatePayload.last_name = lastName
    if (data.email) updatePayload.email = data.email
    if (data.phone) updatePayload.phone = data.phone
    if (data.bio !== undefined) updatePayload.bio = data.bio
    if (data.age !== undefined) updatePayload.age = data.age

    // Update user profile in user service
    const response = await fetch(`${USER_SERVICE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(updatePayload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update profile" }))
      return NextResponse.json(
        { error: error.message || "Failed to update profile" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
