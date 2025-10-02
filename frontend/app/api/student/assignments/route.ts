import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const data = {
    student: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
    },
    courses: [
      { id: "1", title: "Introduction to Computer Science" },
      { id: "2", title: "Web Development Fundamentals" },
      { id: "3", title: "Data Structures and Algorithms" },
      { id: "4", title: "Database Management Systems" },
      { id: "5", title: "Mobile App Development" },
    ],
    assignments: [
      {
        id: "1",
        name: "Binary Search Tree Implementation",
        course: "Data Structures and Algorithms",
        dueDate: "2025-02-15",
        status: "Pending" as const,
      },
      {
        id: "2",
        name: "React Component Design",
        course: "Web Development Fundamentals",
        dueDate: "2025-02-18",
        status: "Pending" as const,
      },
      {
        id: "3",
        name: "SQL Query Optimization",
        course: "Database Management Systems",
        dueDate: "2025-02-20",
        status: "Submitted" as const,
        submittedAt: "2025-02-10",
      },
      {
        id: "4",
        name: "Algorithm Analysis Report",
        course: "Data Structures and Algorithms",
        dueDate: "2025-02-12",
        status: "Graded" as const,
        grade: 92,
        feedback: "Excellent work! Your analysis was thorough and well-structured.",
        submittedAt: "2025-02-08",
      },
      {
        id: "5",
        name: "Python Programming Basics",
        course: "Introduction to Computer Science",
        dueDate: "2025-02-22",
        status: "Pending" as const,
      },
      {
        id: "6",
        name: "Database Schema Design",
        course: "Database Management Systems",
        dueDate: "2025-02-14",
        status: "Graded" as const,
        grade: 88,
        feedback: "Good work! Consider adding more normalization examples.",
        submittedAt: "2025-02-09",
      },
      {
        id: "7",
        name: "Responsive Web Layout",
        course: "Web Development Fundamentals",
        dueDate: "2025-02-16",
        status: "Submitted" as const,
        submittedAt: "2025-02-11",
      },
      {
        id: "8",
        name: "Mobile UI Prototype",
        course: "Mobile App Development",
        dueDate: "2025-02-25",
        status: "Pending" as const,
      },
    ],
  }

  return NextResponse.json(data)
}
