"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface AnalyticsData {
    studentsPerTeacher?: Array<{
        teacherName: string
        studentCount: number
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

    // Show top 5 teachers by student count
    const displayData = studentsPerTeacherData
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5)

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
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">Students per Teacher</CardTitle>
            </CardHeader>
            <CardContent>
                {displayData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={displayData} margin={{ bottom: 60, left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="teacherName" tick={<CustomXAxisTick />} interval={0} height={70} />
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
    )
}
