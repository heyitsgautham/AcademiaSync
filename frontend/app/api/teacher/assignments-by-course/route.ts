import { NextResponse } from "next/server"

export async function GET() {
  // Mock data for assignments organized by course
  const assignmentsByCourse = [
    {
      courseId: "1",
      courseName: "Introduction to React",
      assignments: [
        {
          id: "a1",
          title: "React Components Exercise",
          description: "Build a set of reusable React components",
          dueDate: "2024-02-15",
          status: "active",
          submissions: 38,
          totalStudents: 45,
          totalPoints: 100,
        },
        {
          id: "a2",
          title: "State Management Project",
          description: "Create an app using useState and useEffect hooks",
          dueDate: "2024-02-22",
          status: "active",
          submissions: 42,
          totalStudents: 45,
          totalPoints: 150,
        },
      ],
    },
    {
      courseId: "2",
      courseName: "Advanced JavaScript",
      assignments: [
        {
          id: "a3",
          title: "Async Programming Challenge",
          description: "Implement async/await patterns and error handling",
          dueDate: "2024-02-18",
          status: "active",
          submissions: 25,
          totalStudents: 32,
          totalPoints: 100,
        },
        {
          id: "a4",
          title: "ES6+ Features Quiz",
          description: "Test your knowledge of modern JavaScript features",
          dueDate: "2024-02-10",
          status: "closed",
          submissions: 32,
          totalStudents: 32,
          totalPoints: 50,
        },
      ],
    },
    {
      courseId: "3",
      courseName: "Web Design Fundamentals",
      assignments: [
        {
          id: "a5",
          title: "Responsive Layout Design",
          description: "Create a fully responsive webpage layout",
          dueDate: "2024-02-20",
          status: "active",
          submissions: 20,
          totalStudents: 28,
          totalPoints: 120,
        },
      ],
    },
  ]

  return NextResponse.json(assignmentsByCourse)
}
