"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

interface AnalyticsChartsProps {
  data: any
  isLoading: boolean
}

const GRADE_COLORS = {
  "A (90-100)": "#22c55e", // Green
  "B (80-89)": "#14b8a6", // Teal
  "C (70-79)": "#3b82f6", // Blue
  "D (60-69)": "#eab308", // Yellow
  "F (0-59)": "#ef4444", // Red
}

const COURSE_COLORS = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"]

export function StudentAnalyticsCharts({ data, isLoading }: AnalyticsChartsProps) {
  const [mutedForegroundColor, setMutedForegroundColor] = useState("#9ca3af")

  useEffect(() => {
    const updateColor = () => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--muted-foreground')
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
      attributeFilter: ['class', 'data-theme', 'style']
    })

    return () => observer.disconnect()
  }, [])

  // Custom X-Axis Tick component for wrapping long labels
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const text = payload.value
    const maxCharsPerLine = 15
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

    // Limit to 2 lines with ellipsis
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
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data) return null

  // Safe data access with fallbacks
  const gradeTrends = Array.isArray(data.gradeTrends) ? data.gradeTrends : []
  const assignmentCompletion = Array.isArray(data.assignmentCompletion) ? data.assignmentCompletion : []
  const courseProgress = Array.isArray(data.courseProgress) ? data.courseProgress : []
  const gradeDistribution = Array.isArray(data.gradeDistribution) ? data.gradeDistribution : []

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Grade Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Grade Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={gradeTrends} margin={{ bottom: 20, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: mutedForegroundColor }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: mutedForegroundColor }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground">
              No grade data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Assignment Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentCompletion.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={assignmentCompletion} margin={{ bottom: 20, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: mutedForegroundColor }}
                />
                <YAxis
                  tick={{ fill: mutedForegroundColor }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} name="Completed" />
                <Bar dataKey="total" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground">
              No assignment data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {courseProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseProgress} margin={{ bottom: 60, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="course"
                  tick={<CustomXAxisTick />}
                  interval={0}
                  height={70}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: mutedForegroundColor }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground">
              No course data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {gradeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;

                    // For very small segments (< 5%), use longer radius to prevent overlap
                    const radiusMultiplier = percent < 0.05 ? 2.4 : 1.5;
                    const radius = innerRadius + (outerRadius - innerRadius) * radiusMultiplier;

                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    // Hide labels for extremely small segments (< 1%)
                    if (percent < 0.01) {
                      return null;
                    }

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={mutedForegroundColor}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {`${gradeDistribution[index]?.name}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={65}
                  dataKey="value"
                >
                  {gradeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name as keyof typeof GRADE_COLORS]} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No grade distribution data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
