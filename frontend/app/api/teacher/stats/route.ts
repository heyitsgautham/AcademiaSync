import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const stats = {
    totalCourses: 12,
    totalStudents: 348,
    averageGrade: 87.5,
    pendingAssignments: 23,
  }

  return NextResponse.json(stats)
}
