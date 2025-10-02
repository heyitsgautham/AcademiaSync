import { NextResponse } from "next/server"

export async function GET() {
  // Mock data - replace with real database queries
  const courses = [
    {
      id: "6",
      title: "Machine Learning Fundamentals",
      instructor: "Dr. James Taylor",
      description: "Learn the basics of machine learning, including supervised and unsupervised learning algorithms.",
      duration: "12 weeks",
    },
    {
      id: "7",
      title: "Cloud Computing with AWS",
      instructor: "Prof. Maria Garcia",
      description: "Master cloud computing concepts and AWS services for scalable applications.",
      duration: "10 weeks",
    },
    {
      id: "8",
      title: "Cybersecurity Essentials",
      instructor: "Dr. Robert Lee",
      description: "Understand security principles, threats, and protection mechanisms.",
      duration: "8 weeks",
    },
    {
      id: "9",
      title: "UI/UX Design Principles",
      instructor: "Prof. Anna Martinez",
      description: "Create user-centered designs with modern UI/UX best practices.",
      duration: "6 weeks",
    },
  ]

  return NextResponse.json(courses)
}
