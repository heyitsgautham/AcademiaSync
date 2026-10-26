import { useQuery } from "@tanstack/react-query"
import { courseApi } from "@/lib/api-client"
import type { TeacherCourse } from "@/types/api"

/** The signed-in teacher's courses, shared by the courses, assignments and students pages. */
export function useTeacherCourses(): { courses: TeacherCourse[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: courseApi.getCourses,
  })
  return { courses: data?.courses ?? [], isLoading }
}
