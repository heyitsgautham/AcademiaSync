"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X as ClearIcon } from "lucide-react"
import { StudentAssignmentsTable } from "@/components/student-assignments-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Assignment {
  id: string
  name: string
  course: string
  course_id: string
  dueDate: string
  question?: string
  status: "Pending" | "Submitted" | "Graded"
  submission?: string
  grade?: number
  feedback?: string
  submittedAt?: string
}

interface AssignmentsData {
  student: {
    name: string
    email: string
  }
  assignments: Assignment[]
  courses: Array<{ id: string; title: string }>
}

export default function StudentAssignmentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [courseFilterId, setCourseFilterId] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Get course and status from URL query params ONLY on initial load
  useEffect(() => {
    const courseParam = searchParams.get("course")
    const statusParam = searchParams.get("status")

    if (courseParam) {
      setCourseFilterId(courseParam)
    }

    if (statusParam) {
      // Map status to match the tabs
      const statusMap: { [key: string]: string } = {
        'pending': 'Pending',
        'submitted': 'Submitted',
        'graded': 'Graded'
      }
      setStatusFilter(statusMap[statusParam.toLowerCase()] || "all")
    }
  }, [searchParams])

  const { data, isLoading } = useQuery<AssignmentsData>({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const res = await fetch("/api/student/assignments")
      return res.json()
    },
  })

  // Safe access to data with fallbacks
  const assignments = data?.assignments || []
  const courses = data?.courses || []

  const filteredAssignments = assignments.filter((assignment) => {
    const courseMatch =
      !courseFilterId || assignment.course_id.toString() === courseFilterId
    const statusMatch = statusFilter === "all" || assignment.status === statusFilter
    const searchMatch =
      searchQuery === "" ||
      assignment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchQuery.toLowerCase())
    return courseMatch && statusMatch && searchMatch
  })

  const handleCourseFilterChange = (value: string) => {
    setCourseFilterId(value)
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('course', value)
    } else {
      params.delete('course')
    }
    router.push(`/student/assignments?${params.toString()}`, { scroll: false })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    // Update URL without page reload
    const params = new URLSearchParams(searchParams.toString())
    if (value !== "all") {
      params.set('status', value.toLowerCase())
    } else {
      params.delete('status')
    }
    router.push(`/student/assignments?${params.toString()}`, { scroll: false })
  }

  const handleClearFilters = () => {
    setCourseFilterId("")
    setStatusFilter("all")
    setSearchQuery("")
    router.push('/student/assignments', { scroll: false })
  }

  const hasActiveFilters = courseFilterId !== "" || statusFilter !== "all" || searchQuery !== ""

  return (
    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and submit your course assignments</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {isLoading ? (
              <Skeleton className="h-10 w-full sm:w-[200px]" />
            ) : (
              <Select value={courseFilterId} onValueChange={handleCourseFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(courses) && courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={handleClearFilters}>
                <ClearIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Pending">Pending</TabsTrigger>
            <TabsTrigger value="Submitted">Submitted</TabsTrigger>
            <TabsTrigger value="Graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            {isLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <StudentAssignmentsTable assignments={filteredAssignments} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
