import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const response = await fetch(`${USER_SERVICE_URL}/admin/analytics`, {
            headers: {
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.error || "Failed to fetch analytics" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching admin analytics:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
