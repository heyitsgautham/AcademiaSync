/**
 * Shapes of the JSON the backends return, as the frontend reads them.
 * Field names follow each endpoint: course-service mixes snake_case rows and camelCase objects.
 */

/** GET /api/teacher/recent-submissions on course-service */
export interface RecentSubmission {
  id: string
  studentId: number
  studentName: string
  studentAvatar: string | null
  course: string
  courseId: number
  assignment: string
  assignmentId: number
  status: string
  submittedAt: string
  grade: number | string | null
}
