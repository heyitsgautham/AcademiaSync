import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            console.error("No backend access token in session")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching student profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.first_name) {
            return NextResponse.json({ error: "First name is required" }, { status: 400 })
        }

        // Validate age if provided
        if (body.age !== null && body.age !== undefined && (body.age < 10 || body.age > 100)) {
            return NextResponse.json({ error: "Age must be between 10 and 100" }, { status: 400 })
        }

        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
            body: JSON.stringify({
                first_name: body.first_name,
                last_name: body.last_name,
                age: body.age,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error updating student profile:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
