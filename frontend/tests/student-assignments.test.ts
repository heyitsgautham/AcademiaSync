import { describe, expect, it } from "vitest"
import { toStudentAssignment } from "@/lib/student-assignments"

const submission = {
  id: "41",
  studentId: 7,
  studentName: "Ana A",
  studentAvatar: null,
  course: "Algebra",
  courseId: 3,
  assignment: "Quiz 1",
  assignmentId: 12,
  status: "graded",
  submittedAt: "2 days ago",
  grade: "88.00",
}

describe("toStudentAssignment", () => {
  it("maps a recent submission to a row of the student detail modal", () => {
    expect(toStudentAssignment(submission)).toEqual({
      id: "41",
      title: "Quiz 1",
      course: "Algebra",
      status: "graded",
      grade: "88.00",
      submittedDate: "2 days ago",
    })
  })

  it("fills gaps with the modal's placeholders", () => {
    expect(toStudentAssignment({ ...submission, assignment: "", course: "", status: "", grade: null, submittedAt: "" })).toEqual(
      expect.objectContaining({ title: "Assignment", course: "Unknown Course", status: "pending", grade: null, submittedDate: null }),
    )
  })
})
