import { NextResponse } from "next/server"

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const submissions = [
    {
      id: "1",
      studentName: "Emma Wilson",
      studentAvatar: "/diverse-student-studying.png",
      course: "Computer Science 101",
      assignment: "Data Structures Project",
      status: "completed" as const,
      submittedAt: "2 hours ago",
    },
    {
      id: "2",
      studentName: "Michael Chen",
      studentAvatar: "/diverse-students-studying.png",
      course: "Web Development",
      assignment: "React Portfolio",
      status: "pending" as const,
      submittedAt: "5 hours ago",
    },
    {
      id: "3",
      studentName: "Sophia Rodriguez",
      studentAvatar: "/diverse-students-studying.png",
      course: "Database Systems",
      assignment: "SQL Query Optimization",
      status: "completed" as const,
      submittedAt: "1 day ago",
    },
    {
      id: "4",
      studentName: "James Anderson",
      studentAvatar: "/diverse-group-studying.png",
      course: "Algorithms",
      assignment: "Sorting Algorithms",
      status: "late" as const,
      submittedAt: "2 days ago",
    },
    {
      id: "5",
      studentName: "Olivia Martinez",
      studentAvatar: "/student5-artwork.png",
      course: "Machine Learning",
      assignment: "Linear Regression Model",
      status: "completed" as const,
      submittedAt: "3 days ago",
    },
  ]

  return NextResponse.json(submissions)
}
