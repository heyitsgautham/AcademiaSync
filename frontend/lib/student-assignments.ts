import type { RecentSubmission } from "@/types/api"

/** One row of the student detail modal's assignment list. */
export interface StudentAssignment {
  id: string | number
  title: string
  course: string
  status: string
  grade: number | string | null
  submittedDate: string | null
}

export const toStudentAssignment = (submission: RecentSubmission): StudentAssignment => ({
  id: submission.id || submission.assignmentId,
  title: submission.assignment || "Assignment",
  course: submission.course || "Unknown Course",
  status: submission.status || "pending",
  grade: submission.grade || null,
  submittedDate: submission.submittedAt || null,
})
