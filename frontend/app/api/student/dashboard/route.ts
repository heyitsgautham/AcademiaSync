import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const data = {
    student: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
    },
    stats: {
      totalCourses: 5,
      assignmentsDue: 3,
      assignmentsCompleted: 12,
      averageGrade: 87,
    },
    upcomingPendingAssignments: [
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
        id: "5",
        name: "Mobile UI Design Project",
        course: "Mobile App Development",
        dueDate: "2025-02-22",
        status: "Pending" as const,
      },
    ],
    gradedAssignments: [
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
        id: "6",
        name: "Database Normalization Exercise",
        course: "Database Management Systems",
        dueDate: "2025-02-08",
        status: "Graded" as const,
        grade: 88,
        feedback: "Good understanding of normalization concepts. Minor improvements needed in 3NF.",
        submittedAt: "2025-02-05",
      },
      {
        id: "7",
        name: "HTML/CSS Portfolio Page",
        course: "Web Development Fundamentals",
        dueDate: "2025-02-05",
        status: "Graded" as const,
        grade: 95,
        feedback: "Outstanding work! Your design is clean and responsive.",
        submittedAt: "2025-02-03",
      },
    ],
    analytics: {
      gradesData: [
        { week: "Week 1", grade: 85 },
        { week: "Week 2", grade: 88 },
        { week: "Week 3", grade: 82 },
        { week: "Week 4", grade: 90 },
        { week: "Week 5", grade: 87 },
        { week: "Week 6", grade: 92 },
      ],
      courseProgressData: [
        { course: "CS", progress: 75, color: "#3b82f6" },
        { course: "Web Dev", progress: 60, color: "#06b6d4" },
        { course: "DSA", progress: 45, color: "#8b5cf6" },
        { course: "DBMS", progress: 90, color: "#10b981" },
        { course: "Mobile", progress: 30, color: "#f59e0b" },
      ],
    },
  }

  return NextResponse.json(data)
}
