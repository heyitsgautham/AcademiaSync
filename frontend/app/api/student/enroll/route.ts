import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { courseId } = await request.json()

  // Mock enrollment - replace with real database operation
  console.log("[v0] Enrolling in course:", courseId)

  return NextResponse.json({ success: true })
}
