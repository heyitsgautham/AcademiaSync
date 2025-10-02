import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 900))

  const analytics = {
    studentsPerCourse: [
      { course: "CS 101", students: 45 },
      { course: "Web Dev", students: 38 },
      { course: "Database", students: 32 },
      { course: "Algorithms", students: 28 },
      { course: "ML", students: 25 },
    ],
    assignmentStatus: [
      { name: "Completed", value: 156 },
      { name: "Pending", value: 23 },
    ],
  }

  return NextResponse.json(analytics)
}
