import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"
const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const response = await fetch(`${COURSE_SERVICE_URL}/admin/recent-activity`, {
            headers: {
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.error || "Failed to fetch recent activity" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching admin recent activity:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
