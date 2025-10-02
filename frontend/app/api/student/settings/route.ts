import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const data = {
    student: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      bio: "Computer Science student passionate about web development and AI",
    },
    notifications: {
      emailNotifications: true,
      assignmentReminders: true,
      gradeNotifications: true,
      courseUpdates: false,
    },
  }

  return NextResponse.json(data)
}
