"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Menu, X, ArrowLeft, Eye, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { TeacherDashboardSidebar } from "@/components/teacher-dashboard-sidebar"
import { TeacherDashboardTopbar } from "@/components/teacher-dashboard-topbar"
import { TeacherDashboardLogo } from "@/components/teacher-dashboard-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface Submission {
    student_id: number
    student_name: string
    student_email: string
    submission_id: number | null
    submission_text: string | null
    submitted_at: string | null
    grade: number | null
    feedback: string | null
    status: string
}

export default function SubmissionsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const assignmentId = params.assignmentId as string

    // Pagination and sorting state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortBy, setSortBy] = useState<"name" | "grade">("name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    // Initialize from URL params
    useEffect(() => {
        const pageParam = searchParams.get("page")
        const limitParam = searchParams.get("limit")
        const sortByParam = searchParams.get("sortBy")
        const sortOrderParam = searchParams.get("sortOrder")

        if (pageParam) {
            const page = parseInt(pageParam)
            if (!isNaN(page) && page > 0) {
                setCurrentPage(page)
            }
        }

        if (limitParam) {
            const limit = parseInt(limitParam)
            if (!isNaN(limit) && [5, 10, 25, 50].includes(limit)) {
                setItemsPerPage(limit)
            }
        }

        if (sortByParam && (sortByParam === "name" || sortByParam === "grade")) {
            setSortBy(sortByParam)
        }

        if (sortOrderParam && (sortOrderParam === "asc" || sortOrderParam === "desc")) {
            setSortOrder(sortOrderParam)
        }
    }, [searchParams])

    const { data, isLoading } = useQuery({
        queryKey: ["assignment-submissions", assignmentId],
        queryFn: async () => {
            const res = await fetch(`/api/teacher/assignments/${assignmentId}/submissions`)
            if (!res.ok) throw new Error("Failed to fetch submissions")
            return res.json()
        },
    })

    const assignment = data?.assignment
    const submissions = Array.isArray(data?.submissions) ? data.submissions : []

    // Sort submissions
    const sortedSubmissions = [...submissions].sort((a, b) => {
        if (sortBy === "name") {
            const comparison = a.student_name.localeCompare(b.student_name)
            return sortOrder === "asc" ? comparison : -comparison
        } else if (sortBy === "grade") {
            const gradeA = a.grade ?? -1
            const gradeB = b.grade ?? -1
            return sortOrder === "asc" ? gradeA - gradeB : gradeB - gradeA
        }
        return 0
    })

    // Calculate pagination
    const totalItems = sortedSubmissions.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex)

    // Helper function to update URL params
    const updateUrlParams = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key)
            } else {
                params.set(key, value.toString())
            }
        })

        // Always include page, limit, sortBy, sortOrder
        if (!params.has('page')) {
            params.set('page', currentPage.toString())
        }
        if (!params.has('limit')) {
            params.set('limit', itemsPerPage.toString())
        }
        if (!params.has('sortBy')) {
            params.set('sortBy', sortBy)
        }
        if (!params.has('sortOrder')) {
            params.set('sortOrder', sortOrder)
        }

        // Remove params if they're at default values and no custom sorting
        const page = params.get('page')
        const limit = params.get('limit')
        const sortByParam = params.get('sortBy')
        const sortOrderParam = params.get('sortOrder')

        if (page === '1' && limit === '10' && sortByParam === 'name' && sortOrderParam === 'asc') {
            params.delete('page')
            params.delete('limit')
            params.delete('sortBy')
            params.delete('sortOrder')
        }

        const queryString = params.toString()
        const url = queryString
            ? `/teacher/assignments/${assignmentId}/submissions?${queryString}`
            : `/teacher/assignments/${assignmentId}/submissions`
        router.push(url, { scroll: false })
    }

    const handleItemsPerPageChange = (value: string) => {
        const newLimit = Number(value)
        setItemsPerPage(newLimit)
        setCurrentPage(1)
        updateUrlParams({
            page: 1,
            limit: newLimit,
            sortBy,
            sortOrder
        })
    }

    const handlePreviousPage = () => {
        const newPage = Math.max(currentPage - 1, 1)
        setCurrentPage(newPage)
        updateUrlParams({
            page: newPage,
            limit: itemsPerPage,
            sortBy,
            sortOrder
        })
    }

    const handleNextPage = () => {
        const newPage = Math.min(currentPage + 1, totalPages)
        setCurrentPage(newPage)
        updateUrlParams({
            page: newPage,
            limit: itemsPerPage,
            sortBy,
            sortOrder
        })
    }

    const handleSortChange = (newSortBy: "name" | "grade") => {
        let newSortOrder: "asc" | "desc" = "asc"

        // Toggle sort order if clicking the same column
        if (sortBy === newSortBy) {
            newSortOrder = sortOrder === "asc" ? "desc" : "asc"
        }

        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setCurrentPage(1)
        updateUrlParams({
            page: 1,
            limit: itemsPerPage,
            sortBy: newSortBy,
            sortOrder: newSortOrder
        })
    }

    const handleViewSubmission = (submission: Submission) => {
        router.push(`/teacher/assignments/${assignmentId}/submissions/${submission.student_id}`)
    }

    const getStatusBadge = (submission: Submission) => {
        if (submission.grade !== null) {
            return <Badge variant="default">Graded</Badge>
        }
        if (submission.status === "Submitted") {
            return <Badge variant="secondary">Submitted</Badge>
        }
        if (submission.status === "Late") {
            return <Badge variant="destructive">Late</Badge>
        }
        return <Badge variant="outline">Not Submitted</Badge>
    }

    return (
        <div className="flex h-screen bg-background">
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border lg:justify-center">
                    <TeacherDashboardLogo />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <TeacherDashboardSidebar />
            </aside>

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 lg:flex-none">
                        <h2 className="text-lg font-semibold text-foreground lg:hidden">Submissions</h2>
                    </div>
                    <TeacherDashboardTopbar />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                                    {assignment?.title || "Assignment Submissions"}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    View and grade student submissions
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 rounded-lg" />
                                ))}
                            </div>
                        ) : submissions.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <p className="text-muted-foreground">No students enrolled in this course</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[250px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 -ml-3"
                                                                onClick={() => handleSortChange("name")}
                                                            >
                                                                Student Name
                                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                                {sortBy === "name" && (
                                                                    <span className="ml-1 text-xs">
                                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead className="w-[250px]">Email</TableHead>
                                                        <TableHead className="w-[150px]">Status</TableHead>
                                                        <TableHead className="w-[100px] text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 -ml-3"
                                                                onClick={() => handleSortChange("grade")}
                                                            >
                                                                Grade
                                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                                {sortBy === "grade" && (
                                                                    <span className="ml-1 text-xs">
                                                                        {sortOrder === "asc" ? "↑" : "↓"}
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead className="w-[180px]">Submitted At</TableHead>
                                                        <TableHead className="w-[100px] text-center">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedSubmissions.map((submission: Submission) => (
                                                        <TableRow key={submission.student_id} className="hover:bg-muted/50">
                                                            <TableCell className="font-medium">{submission.student_name}</TableCell>
                                                            <TableCell className="text-muted-foreground">{submission.student_email}</TableCell>
                                                            <TableCell>{getStatusBadge(submission)}</TableCell>
                                                            <TableCell className="text-center">
                                                                {submission.grade !== null ? (
                                                                    <span className="font-semibold">{submission.grade}/100</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {submission.submitted_at ? (
                                                                    <span className="text-sm">
                                                                        {new Date(submission.submitted_at).toLocaleDateString()} {new Date(submission.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleViewSubmission(submission)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pagination Controls */}
                                {totalItems > 0 && (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>
                                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} students
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5 per page</SelectItem>
                                                    <SelectItem value="10">10 per page</SelectItem>
                                                    <SelectItem value="25">25 per page</SelectItem>
                                                    <SelectItem value="50">50 per page</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    <span className="hidden sm:inline ml-1">Previous</span>
                                                </Button>
                                                <div className="px-3 py-1 text-sm text-muted-foreground">
                                                    Page {currentPage} of {totalPages}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <span className="hidden sm:inline mr-1">Next</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
