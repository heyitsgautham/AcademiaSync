import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  const data = await request.json()

  // Mock update - replace with real database operation
  console.log("[v0] Updating profile:", data)

  return NextResponse.json({ success: true })
}
