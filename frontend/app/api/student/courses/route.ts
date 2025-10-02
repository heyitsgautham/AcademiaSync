import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const data = {
    student: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
    },
    courses: [
      {
        id: "1",
        title: "Introduction to Computer Science",
        instructor: "Dr. Sarah Smith",
        progress: 75,
      },
      {
        id: "2",
        title: "Web Development Fundamentals",
        instructor: "Prof. Michael Chen",
        progress: 60,
      },
      {
        id: "3",
        title: "Data Structures and Algorithms",
        instructor: "Dr. Emily Brown",
        progress: 45,
      },
      {
        id: "4",
        title: "Database Management Systems",
        instructor: "Prof. David Wilson",
        progress: 90,
      },
      {
        id: "5",
        title: "Mobile App Development",
        instructor: "Dr. Lisa Anderson",
        progress: 30,
      },
      {
        id: "6",
        title: "Software Engineering Principles",
        instructor: "Prof. John Davis",
        progress: 55,
      },
    ],
  }

  return NextResponse.json(data)
}
