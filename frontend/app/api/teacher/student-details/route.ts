import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(session as any).backendAccessToken) {
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

    const authHeader = `Bearer ${(session as any).backendAccessToken}`

    // Fetch student's submissions from the teacher's courses
    // We'll use the recent-submissions endpoint filtered by student
    const submissionsResponse = await fetch(
      `${COURSE_SERVICE_URL}/api/teacher/recent-submissions?limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
      }
    )

    if (!submissionsResponse.ok) {
      console.error("Failed to fetch submissions:", submissionsResponse.statusText)
      return NextResponse.json({
        id: studentId,
        assignments: [],
      })
    }

    const submissionsData = await submissionsResponse.json()
    const allSubmissions = Array.isArray(submissionsData)
      ? submissionsData
      : submissionsData.submissions || []

    // Filter submissions for this specific student AND course
    const studentSubmissions = allSubmissions.filter(
      (submission: any) =>
        submission.studentId?.toString() === studentId &&
        submission.courseId?.toString() === courseId
    )

    // Format assignments to match what the modal component expects
    const formattedAssignments = studentSubmissions.map((submission: any) => ({
      id: submission.id || submission.assignmentId,
      title: submission.assignment || submission.assignmentTitle || submission.title || "Assignment",
      course: submission.course || submission.courseName || "Unknown Course",
      status: submission.status || "pending",
      grade: submission.grade || null,
      submittedDate: submission.submittedAt || null,
    }))

    return NextResponse.json({
      id: studentId,
      assignments: formattedAssignments,
    })
  } catch (error) {
    console.error("Error fetching student details:", error)
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    )
  }
}
