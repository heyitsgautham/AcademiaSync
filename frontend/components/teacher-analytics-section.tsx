"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AnalyticsData {
  studentsPerCourse: Array<{ course: string; students: number }>
  assignmentStatus: Array<{ name: string; value: number }>
}

interface AnalyticsSectionProps {
  analytics?: AnalyticsData
  isLoading: boolean
}

const COLORS = ["#34d399", "#fbbf24"]

export function TeacherAnalyticsSection({ analytics, isLoading }: AnalyticsSectionProps) {
  const [mutedForegroundColor, setMutedForegroundColor] = useState("#9ca3af")

  useEffect(() => {
    // Get computed color from CSS variable for muted-foreground
    const updateColor = () => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--muted-foreground')
        .trim()

      if (color) {
        // Color is already in hex format (#9ca3af), use it directly
        setMutedForegroundColor(color)
      }
    }

    // Update color initially
    updateColor()

    // Listen for theme changes (when user toggles theme)
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style']
    })

    return () => observer.disconnect()
  }, [])
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Safe data extraction with fallbacks
  const studentsPerCourseData = Array.isArray(analytics?.studentsPerCourse)
    ? analytics.studentsPerCourse
    : []

  // Get top 5 courses by student count
  const studentsPerCourse = studentsPerCourseData
    .sort((a, b) => b.students - a.students)
    .slice(0, 5)

  const assignmentStatus = Array.isArray(analytics?.assignmentStatus)
    ? analytics.assignmentStatus
    : []

  // Custom tick component for X-axis to handle long course names
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const text = payload.value
    const maxCharsPerLine = 15 // Maximum characters per line
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

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

    // Limit to 2 lines and add ellipsis if needed
    const displayLines = lines.slice(0, 2)
    if (lines.length > 2) {
      displayLines[1] = displayLines[1].substring(0, 12) + '...'
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
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Bar Chart - Students per Course */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Students per Course</h3>
          {studentsPerCourse.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studentsPerCourse} margin={{ bottom: 60, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="course"
                  className="text-xs"
                  tick={<CustomXAxisTick />}
                  interval={0}
                  height={70}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: mutedForegroundColor }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="students" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No course data available
            </div>
          )}
        </div>

        {/* Pie Chart - Assignment Status */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Assignment Status</h3>
          {assignmentStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={assignmentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    // Increase radius for label placement
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={mutedForegroundColor}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {`${assignmentStatus[index].name}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assignmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No assignment data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
