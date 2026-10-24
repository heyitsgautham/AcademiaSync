import { redirect } from "next/navigation"

// The teacher detail page already lists their courses, so this URL sends people there.
export default function TeacherCoursesPage({ params }: { params: { id: string } }) {
  redirect(`/admin/teachers/${params.id}`)
}
