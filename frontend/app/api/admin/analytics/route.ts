import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!ANALYTICS_API_KEY) {
            return NextResponse.json({ error: "Analytics API key is not configured" }, { status: 503 })
        }

        const response = await fetch(`${USER_SERVICE_URL}/admin/analytics?apiKey=${encodeURIComponent(ANALYTICS_API_KEY)}`, {
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
