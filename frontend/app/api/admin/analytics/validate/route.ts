import { NextResponse } from "next/server"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY || "academiasync-analytics-key-2025-secure"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const apiKey = searchParams.get('apiKey')

        // Check if API key matches
        if (!apiKey || apiKey !== ANALYTICS_API_KEY) {
            return NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            )
        }

        // API key is valid
        return NextResponse.json(
            { valid: true, message: "API key is valid" },
            { status: 200 }
        )
    } catch (error) {
        console.error("API key validation error:", error)
        return NextResponse.json(
            { error: "Validation failed" },
            { status: 500 }
        )
    }
}