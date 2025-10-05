import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001";

export async function GET(
    request: Request,
    { params }: { params: { assignmentId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !(session as any).backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { assignmentId } = params

        const response = await fetch(
            `${COURSE_SERVICE_URL}/api/student/assignments/${assignmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${(session as any).backendAccessToken}`,
                },
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error("[Student Assignment Details API] Error response:", errorText)
            try {
                const error = JSON.parse(errorText)
                return NextResponse.json(error, { status: response.status })
            } catch {
                return NextResponse.json({ error: errorText }, { status: response.status })
            }
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("[Student Assignment Details API] Exception:", error)
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
