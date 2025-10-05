import { TeacherThemeWrapper } from "@/components/teacher-theme-wrapper"

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <TeacherThemeWrapper>{children}</TeacherThemeWrapper>
}
