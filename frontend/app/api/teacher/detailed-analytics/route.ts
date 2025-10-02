import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") || "monthly"

  // Generate different data based on time filter
  const getTimeLabels = () => {
    switch (filter) {
      case "weekly":
        return ["Week 1", "Week 2", "Week 3", "Week 4"]
      case "biweekly":
        return ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"]
      case "monthly":
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      default:
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    }
  }

  const timeLabels = getTimeLabels()

  const analyticsData = {
    coursePerformance: [
      { course: "React", performance: 85 },
      { course: "JavaScript", performance: 78 },
      { course: "Web Design", performance: 92 },
      { course: "Node.js", performance: 81 },
      { course: "TypeScript", performance: 88 },
    ],
    studentProgress: timeLabels.map((period, index) => ({
      period,
      progress: 60 + index * 5 + Math.random() * 10,
    })),
    completionRates: [
      { assignment: "Assignment 1", rate: 95 },
      { assignment: "Assignment 2", rate: 88 },
      { assignment: "Assignment 3", rate: 92 },
      { assignment: "Assignment 4", rate: 78 },
      { assignment: "Assignment 5", rate: 85 },
    ],
    gradeDistribution: [
      { name: "A (90-100)", value: 35 },
      { name: "B (80-89)", value: 28 },
      { name: "C (70-79)", value: 20 },
      { name: "D (60-69)", value: 12 },
      { name: "F (0-59)", value: 5 },
    ],
  }

  return NextResponse.json(analyticsData)
}
