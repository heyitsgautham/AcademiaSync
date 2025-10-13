import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string; courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.backendAccessToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        if ((session as any).user?.role !== "Admin") {
            return NextResponse.json(
                { error: "Forbidden - Admin access required" },
                { status: 403 }
            )
        }

        const { courseId } = params

        // Fetch students enrolled in this course with their grades
        const response = await fetch(
            `${COURSE_SERVICE_URL}/admin/courses/${courseId}/students/grades`,
            {
                headers: {
                    Authorization: `Bearer ${session.backendAccessToken}`,
                },
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: errorData.error || "Failed to fetch course students" },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching course students:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
