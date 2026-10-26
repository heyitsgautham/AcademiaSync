import { NextResponse } from "next/server"
import { backendSession, backendUrl } from "@/lib/backend-proxy"
import { toStudentAssignment } from "@/lib/student-assignments"
import type { RecentSubmission } from "@/types/api"

// Builds the teacher's view of one student in one course from their 100 most recent submissions.
export async function GET(request: Request) {
  try {
    const session = await backendSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("id")
    const courseId = searchParams.get("courseId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const response = await fetch(`${backendUrl("course")}/api/teacher/recent-submissions?limit=100`, {
      headers: { Authorization: `Bearer ${session.backendAccessToken}` },
    })

    if (!response.ok) {
      console.error("Failed to fetch submissions:", response.statusText)
      return NextResponse.json({ id: studentId, assignments: [] })
    }

    const data: RecentSubmission[] | { submissions?: RecentSubmission[] } = await response.json()
    const submissions = Array.isArray(data) ? data : data.submissions || []

    const assignments = submissions
      .filter((s) => s.studentId?.toString() === studentId && s.courseId?.toString() === courseId)
      .map(toStudentAssignment)

    return NextResponse.json({ id: studentId, assignments })
  } catch (error) {
    console.error("Error fetching student details:", error)
    return NextResponse.json({ error: "Failed to fetch student details" }, { status: 500 })
  }
}
