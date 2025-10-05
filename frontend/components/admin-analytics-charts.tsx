"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsData {
    studentsPerTeacher?: Array<{
        teacherName: string
        studentCount: number
    }>
    topStudents?: Array<{
        id: number
        studentName: string
        profilePicture?: string
        avgGrade: string
        submissionCount: number
    }>
    topTeachers?: Array<{
        id: number
        teacherName: string
        profilePicture?: string
        avgGrade: string
        studentCount: number
    }>
    topCourses?: Array<{
        courseName: string
        avgGrade: string
        enrolledCount: number
        submissionCount: number
    }>
}

interface AdminAnalyticsChartsProps {
    analytics?: AnalyticsData
    isLoading: boolean
}

export function AdminAnalyticsCharts({ analytics, isLoading }: AdminAnalyticsChartsProps) {
    const [mutedForegroundColor, setMutedForegroundColor] = useState("#9ca3af")

    useEffect(() => {
        const updateColor = () => {
            const color = getComputedStyle(document.documentElement)
                .getPropertyValue("--muted-foreground")
                .trim()

            if (color) {
                setMutedForegroundColor(color)
            }
        }

        updateColor()

        // Listen for theme changes
        const observer = new MutationObserver(updateColor)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "style"],
        })

        return () => observer.disconnect()
    }, [])

    const studentsPerTeacherData = Array.isArray(analytics?.studentsPerTeacher)
        ? analytics.studentsPerTeacher
        : []

    const topStudentsData = Array.isArray(analytics?.topStudents)
        ? analytics.topStudents
        : []

    const topTeachersData = Array.isArray(analytics?.topTeachers)
        ? analytics.topTeachers
        : []

    const topCoursesData = Array.isArray(analytics?.topCourses)
        ? analytics.topCourses
        : []

    // Show top 5 teachers by student count
    const displayStudentsPerTeacher = studentsPerTeacherData
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5)

    // Helper function to get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const CustomXAxisTick = ({ x, y, payload }: any) => {
        const text = payload.value
        const maxCharsPerLine = 15
        const words = text.split(" ")
        const lines: string[] = []
        let currentLine = ""

        words.forEach((word: string) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word

            if (testLine.length > maxCharsPerLine && currentLine) {
                lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = testLine
            }
        })

        if (currentLine) {
            lines.push(currentLine)
        }

        // Limit to 2 lines with ellipsis
        const displayLines = lines.slice(0, 2)
        if (lines.length > 2) {
            displayLines[1] = displayLines[1].substring(0, 12) + "..."
        }

        return (
            <g transform={`translate(${x},${y})`}>
                {displayLines.map((line, index) => (
                    <text
                        key={index}
                        x={0}
                        y={0}
                        dy={index * 14 + 8}
                        textAnchor="middle"
                        fill={mutedForegroundColor}
                        fontSize="11"
                    >
                        {line}
                    </text>
                ))}
            </g>
        )
    }

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-foreground">Students per Teacher</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            Loading analytics...
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-foreground">Top Performing Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            Loading analytics...
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-foreground">Top 5 Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            Loading analytics...
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-foreground">Top 5 Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            Loading analytics...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Students per Teacher Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">Students per Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                    {displayStudentsPerTeacher.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={displayStudentsPerTeacher} margin={{ bottom: 60, left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="teacherName" tick={{ fill: mutedForegroundColor, fontSize: 11 }} interval={0} height={70} angle={-45} textAnchor="end" />
                                <YAxis tick={{ fill: mutedForegroundColor }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                        color: "hsl(var(--foreground))",
                                    }}
                                    labelStyle={{ color: "hsl(var(--foreground))" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                                <Bar dataKey="studentCount" fill="#dc2626" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top Performing Courses Chart - Keep this one */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">Top 5 Performing Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    {topCoursesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topCoursesData} margin={{ bottom: 60, left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="courseName" tick={{ fill: mutedForegroundColor, fontSize: 11 }} interval={0} height={70} angle={-45} textAnchor="end" />
                                <YAxis
                                    tick={{ fill: mutedForegroundColor }}
                                    allowDecimals={true}
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                        color: "hsl(var(--foreground))",
                                    }}
                                    labelStyle={{ color: "hsl(var(--foreground))" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                    formatter={(value: any, name: string) => {
                                        if (name === "avgGrade") return [value, "Average Grade"]
                                        return [value, name]
                                    }}
                                />
                                <Bar dataKey="avgGrade" fill="#a855f7" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top 5 Teachers List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">Top 5 Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    {topTeachersData.length > 0 ? (
                        <div className="space-y-4">
                            {topTeachersData.map((teacher, index) => (
                                <div
                                    key={teacher.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-500 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={teacher.profilePicture} alt={teacher.teacherName} />
                                            <AvatarFallback className="text-sm bg-green-500/10 text-green-500">
                                                {getInitials(teacher.teacherName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{teacher.teacherName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {teacher.studentCount} {teacher.studentCount === 1 ? 'student' : 'students'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="default" className="text-sm font-semibold bg-green-500 hover:bg-green-600">
                                        {teacher.avgGrade}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Top 5 Students List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold text-foreground">Top 5 Students</CardTitle>
                </CardHeader>
                <CardContent>
                    {topStudentsData.length > 0 ? (
                        <div className="space-y-4">
                            {topStudentsData.map((student, index) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.profilePicture} alt={student.studentName} />
                                            <AvatarFallback className="text-sm bg-blue-500/10 text-blue-500">
                                                {getInitials(student.studentName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{student.studentName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {student.submissionCount} {student.submissionCount === 1 ? 'submission' : 'submissions'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="default" className="text-sm font-semibold bg-blue-500 hover:bg-blue-600">
                                        {student.avgGrade}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                            No data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
