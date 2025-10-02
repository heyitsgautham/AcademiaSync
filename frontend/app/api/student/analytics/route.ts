import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const data = {
    student: {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
    },
    weekly: {
      gradesData: [
        { week: "Week 1", grade: 85 },
        { week: "Week 2", grade: 88 },
        { week: "Week 3", grade: 82 },
        { week: "Week 4", grade: 90 },
        { week: "Week 5", grade: 87 },
        { week: "Week 6", grade: 92 },
      ],
      assignmentCompletion: [
        { week: "Week 1", completed: 3, total: 4 },
        { week: "Week 2", completed: 4, total: 4 },
        { week: "Week 3", completed: 2, total: 3 },
        { week: "Week 4", completed: 5, total: 5 },
        { week: "Week 5", completed: 3, total: 4 },
        { week: "Week 6", completed: 4, total: 4 },
      ],
      courseProgress: [
        { course: "CS", progress: 75, color: "#3b82f6" },
        { course: "Web Dev", progress: 60, color: "#06b6d4" },
        { course: "DSA", progress: 45, color: "#8b5cf6" },
        { course: "DBMS", progress: 90, color: "#10b981" },
        { course: "Mobile", progress: 30, color: "#f59e0b" },
      ],
      gradeDistribution: [
        { grade: "A", count: 8, color: "#10b981" },
        { grade: "B", count: 5, color: "#3b82f6" },
        { grade: "C", count: 2, color: "#f59e0b" },
        { grade: "D", count: 0, color: "#ef4444" },
      ],
    },
    monthly: {
      gradesData: [
        { month: "Jan", grade: 86 },
        { month: "Feb", grade: 89 },
        { month: "Mar", grade: 87 },
      ],
      assignmentCompletion: [
        { month: "Jan", completed: 12, total: 15 },
        { month: "Feb", completed: 14, total: 16 },
        { month: "Mar", completed: 10, total: 12 },
      ],
      courseProgress: [
        { course: "CS", progress: 75, color: "#3b82f6" },
        { course: "Web Dev", progress: 60, color: "#06b6d4" },
        { course: "DSA", progress: 45, color: "#8b5cf6" },
        { course: "DBMS", progress: 90, color: "#10b981" },
        { course: "Mobile", progress: 30, color: "#f59e0b" },
      ],
      gradeDistribution: [
        { grade: "A", count: 20, color: "#10b981" },
        { grade: "B", count: 12, color: "#3b82f6" },
        { grade: "C", count: 4, color: "#f59e0b" },
        { grade: "D", count: 0, color: "#ef4444" },
      ],
    },
    semester: {
      gradesData: [
        { period: "Fall 2024", grade: 88 },
        { period: "Spring 2025", grade: 87 },
      ],
      assignmentCompletion: [
        { period: "Fall 2024", completed: 45, total: 50 },
        { period: "Spring 2025", completed: 36, total: 43 },
      ],
      courseProgress: [
        { course: "CS", progress: 75, color: "#3b82f6" },
        { course: "Web Dev", progress: 60, color: "#06b6d4" },
        { course: "DSA", progress: 45, color: "#8b5cf6" },
        { course: "DBMS", progress: 90, color: "#10b981" },
        { course: "Mobile", progress: 30, color: "#f59e0b" },
      ],
      gradeDistribution: [
        { grade: "A", count: 50, color: "#10b981" },
        { grade: "B", count: 28, color: "#3b82f6" },
        { grade: "C", count: 8, color: "#f59e0b" },
        { grade: "D", count: 1, color: "#ef4444" },
      ],
    },
  }

  return NextResponse.json(data)
}
