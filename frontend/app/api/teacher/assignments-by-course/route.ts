import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

const COURSE_SERVICE_URL = process.env.INTERNAL_COURSE_SERVICE_URL || "http://course-service:5001"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !(session as any).backendAccessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authHeader = `Bearer ${(session as any).backendAccessToken}`

    // First, fetch all courses for the teacher
    const coursesResponse = await fetch(`${COURSE_SERVICE_URL}/api/teacher/courses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    })

    if (!coursesResponse.ok) {
      throw new Error(`Failed to fetch courses: ${coursesResponse.statusText}`)
    }

    const coursesData = await coursesResponse.json()
    const courses = Array.isArray(coursesData) ? coursesData : coursesData.courses || []

    // Then fetch assignments for each course
    const assignmentsByCourse = await Promise.all(
      courses.map(async (course: any) => {
        try {
          const assignmentsResponse = await fetch(
            `${COURSE_SERVICE_URL}/api/teacher/courses/${course.id}/assignments`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
              },
            }
          )

          if (!assignmentsResponse.ok) {
            console.error(`Failed to fetch assignments for course ${course.id}`)
            return {
              courseId: course.id,
              courseName: course.title,
              assignments: [],
            }
          }

          const assignmentsData = await assignmentsResponse.json()
          const assignments = Array.isArray(assignmentsData)
            ? assignmentsData
            : assignmentsData.assignments || []

          return {
            courseId: course.id,
            courseName: course.title,
            assignments: assignments.map((assignment: any) => ({
              id: assignment.id,
              title: assignment.title,
              description: assignment.description,
              dueDate: assignment.due_date,
              status: assignment.status || "active",
              submissions: assignment.submission_count || 0,
              totalStudents: course.students_enrolled || 0,
              totalPoints: assignment.total_points || 100,
            })),
          }
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.id}:`, error)
          return {
            courseId: course.id,
            courseName: course.title,
            assignments: [],
          }
        }
      })
    )

    return NextResponse.json(assignmentsByCourse)
  } catch (error) {
    console.error("Error fetching assignments by course:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments by course" },
      { status: 500 }
    )
  }
}
