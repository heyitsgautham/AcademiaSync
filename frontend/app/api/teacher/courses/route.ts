import { NextResponse } from "next/server"

export async function GET() {
  // Mock data for courses
  const courses = [
    {
      id: "1",
      title: "Introduction to React",
      description: "Learn the fundamentals of React including components, props, state, and hooks.",
      studentsEnrolled: 45,
      progress: 75,
      color: "bg-primary",
      duration: "8 weeks",
    },
    {
      id: "2",
      title: "Advanced JavaScript",
      description: "Deep dive into advanced JavaScript concepts, async programming, and modern ES6+ features.",
      studentsEnrolled: 32,
      progress: 60,
      color: "bg-chart-2",
      duration: "10 weeks",
    },
    {
      id: "3",
      title: "Web Design Fundamentals",
      description: "Master the principles of web design, UI/UX, and responsive layouts.",
      studentsEnrolled: 28,
      progress: 85,
      color: "bg-chart-3",
      duration: "6 weeks",
    },
    {
      id: "4",
      title: "Node.js Backend Development",
      description: "Build scalable backend applications with Node.js, Express, and databases.",
      studentsEnrolled: 38,
      progress: 45,
      color: "bg-chart-4",
      duration: "12 weeks",
    },
    {
      id: "5",
      title: "TypeScript Essentials",
      description: "Learn TypeScript from basics to advanced type systems and generics.",
      studentsEnrolled: 41,
      progress: 90,
      color: "bg-primary",
      duration: "5 weeks",
    },
    {
      id: "6",
      title: "Database Design",
      description: "Understand relational and NoSQL databases, schema design, and optimization.",
      studentsEnrolled: 25,
      progress: 55,
      color: "bg-chart-2",
      duration: "8 weeks",
    },
  ]

  return NextResponse.json(courses)
}
