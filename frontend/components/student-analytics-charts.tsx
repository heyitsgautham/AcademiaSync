"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface GradeData {
  week: string
  grade: number
}

interface CourseProgressData {
  course: string
  progress: number
  color: string
}

interface StudentAnalyticsChartsProps {
  gradesData: GradeData[]
  courseProgressData: CourseProgressData[]
}

export function StudentAnalyticsCharts({ gradesData, courseProgressData }: StudentAnalyticsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Grades Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Grades Trend Over Time</CardTitle>
          <CardDescription>Your performance across all assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              grade: {
                label: "Grade",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="grade"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Course Progress Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress Distribution</CardTitle>
          <CardDescription>Completion status across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseProgressData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ course, progress }) => `${course}: ${progress}%`}
                outerRadius={80}
                dataKey="progress"
              >
                {courseProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
