import { NextResponse } from "next/server"

export async function GET() {
  // Mock data for students organized by course
  const studentsByCourse = [
    {
      courseId: "1",
      courseName: "Introduction to React",
      students: [
        {
          id: "s1",
          name: "Emma Wilson",
          email: "emma.wilson@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 92,
        },
        {
          id: "s2",
          name: "James Chen",
          email: "james.chen@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 88,
        },
        {
          id: "s3",
          name: "Sofia Rodriguez",
          email: "sofia.rodriguez@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 76,
        },
      ],
    },
    {
      courseId: "2",
      courseName: "Advanced JavaScript",
      students: [
        {
          id: "s4",
          name: "Michael Brown",
          email: "michael.brown@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 85,
        },
        {
          id: "s5",
          name: "Olivia Taylor",
          email: "olivia.taylor@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 91,
        },
      ],
    },
    {
      courseId: "3",
      courseName: "Web Design Fundamentals",
      students: [
        {
          id: "s6",
          name: "Liam Anderson",
          email: "liam.anderson@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 79,
        },
        {
          id: "s7",
          name: "Ava Martinez",
          email: "ava.martinez@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 94,
        },
        {
          id: "s8",
          name: "Noah Johnson",
          email: "noah.johnson@email.com",
          avatar: "/placeholder.svg?height=40&width=40",
          performance: 82,
        },
      ],
    },
  ]

  return NextResponse.json(studentsByCourse)
}
