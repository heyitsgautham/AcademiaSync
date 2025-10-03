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
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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

export function TeacherAnalyticsCharts({ data, isLoading }: AnalyticsChartsProps) {
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.coursePerformance} margin={{ bottom: 60, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="course"
                tick={<CustomXAxisTick />}
                interval={0}
                height={70}
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
              <Bar dataKey="performance" fill="#84cc16" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Student Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.studentProgress} margin={{ bottom: 20, left: 10, right: 10 }}>
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
                dataKey="progress"
                stroke="#84cc16"
                strokeWidth={3}
                dot={{ fill: "#84cc16", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assignment Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Assignment Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.completionRates} margin={{ bottom: 60, left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="assignment"
                tick={<CustomXAxisTick />}
                interval={0}
                height={70}
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
              <Bar dataKey="rate" fill="#84cc16" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
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
                      {`${data?.gradeDistribution[index]?.name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
                outerRadius={65}
                dataKey="value"
              >
                {data?.gradeDistribution?.map((entry: any, index: number) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
