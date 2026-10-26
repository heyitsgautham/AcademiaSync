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

/** A course as course-service's teacher routes return it. Counts arrive as numeric strings. */
export interface TeacherCourse {
  id: number
  title: string
  description: string
  weeks: number | null
  created_at: string
  updated_at: string
  students_enrolled: string | number
  teacher_id?: number
}

/** GET /api/teacher/courses */
export interface TeacherCourseList {
  courses: TeacherCourse[]
}

/** An assignment row from course-service. */
export interface Assignment {
  id: number
  course_id: number
  title: string
  description: string
  due_date: string | null
  created_at: string
  updated_at: string
  submission_count?: string | number
  teacher_id?: number
}

/** GET /api/teacher/courses/:courseId/assignments */
export interface AssignmentList {
  assignments: Assignment[]
}

/** GET /api/teacher/assignments-with-status: an assignment with its submission counts. */
export interface AssignmentWithStatus extends Assignment {
  course_name: string
  total_students: number
  total_submissions: number
  graded_submissions: number
  late_submissions: number
  average_grade: number | null
  not_submitted: number
  submitted_not_graded: number
  has_submissions: boolean
  has_graded: boolean
  has_not_submitted: boolean
  has_late: boolean
  is_overdue: boolean
}

/** One course's group on the teacher assignments page. */
export interface CourseAssignments {
  courseId: number
  courseName: string
  assignments: AssignmentWithStatus[]
}

/** A student in GET /api/teacher/students-by-course. */
export interface CourseStudent {
  id: string
  name: string
  email: string
  avatar: string | null
  performance: string
}

export interface StudentsInCourse {
  courseId: string
  courseName: string
  students: CourseStudent[]
  studentCount: number
}

/** GET /api/teacher/students-by-course */
export interface StudentsByCourseResponse {
  data: StudentsInCourse[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
}

/** A student row on the teacher students page, tagged with the course it was listed under. */
export interface StudentInCourse extends CourseStudent {
  courseName: string
  courseId: string
}

/** GET /api/student/analytics on course-service */
export interface StudentAnalytics {
  gradeTrends: Array<{ period: string; grade: number }>
  assignmentCompletion: Array<{ period: string; completed: number; total: number }>
  courseProgress: Array<{ course: string; progress: number }>
  gradeDistribution: Array<{ name: string; value: number }>
}

/** GET /api/teacher/analytics/detailed on course-service */
export interface TeacherDetailedAnalytics {
  coursePerformance: Array<{ course: string; performance: number }>
  studentProgress: Array<{ period: string; progress: number }>
  completionRates: Array<{ assignment: string; rate: number }>
  gradeDistribution: Array<{ name: string; value: number }>
}
