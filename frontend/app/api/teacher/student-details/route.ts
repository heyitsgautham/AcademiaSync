import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("id")

  // Mock detailed student data with assignments
  const studentDetails = {
    id: studentId,
    assignments: [
      {
        id: "a1",
        title: "React Components Exercise",
        course: "Introduction to React",
        status: "completed",
        grade: 95,
        submittedDate: "2024-01-15",
      },
      {
        id: "a2",
        title: "State Management Project",
        course: "Introduction to React",
        status: "completed",
        grade: 88,
        submittedDate: "2024-01-22",
      },
      {
        id: "a3",
        title: "Hooks Deep Dive",
        course: "Introduction to React",
        status: "pending",
        grade: null,
        submittedDate: null,
      },
      {
        id: "a4",
        title: "Final Project",
        course: "Introduction to React",
        status: "late",
        grade: 72,
        submittedDate: "2024-02-05",
      },
      {
        id: "a5",
        title: "Quiz 1",
        course: "Introduction to React",
        status: "incomplete",
        grade: null,
        submittedDate: null,
      },
    ],
  }

  return NextResponse.json(studentDetails)
}
