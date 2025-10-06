"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Course {
    id: number
    title: string
    description: string
    teacherId: number
    teacherName: string
    enrolledCount?: number
    createdAt: string
}

interface AdminCoursesTableProps {
    courses: Course[]
    isLoading: boolean
}

type SortField = "title" | "teacherName" | "enrolledCount" | "createdAt"
type SortOrder = "asc" | "desc"

export function AdminCoursesTable({ courses, isLoading }: AdminCoursesTableProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortField, setSortField] = useState<SortField>("createdAt")
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

    const coursesArray = Array.isArray(courses) ? courses : []

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
        }
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />
        }
        return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
    }

    // Filter and sort courses
    const filteredAndSortedCourses = useMemo(() => {
        let result = coursesArray.filter((course) => {
            const matchesSearch =
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesSearch
        })

        // Sort courses
        result.sort((a, b) => {
            let aValue: any = a[sortField]
            let bValue: any = b[sortField]

            // Handle undefined values
            if (aValue === undefined) aValue = ""
            if (bValue === undefined) bValue = ""

            // Convert to lowercase for string comparison
            if (typeof aValue === "string") aValue = aValue.toLowerCase()
            if (typeof bValue === "string") bValue = bValue.toLowerCase()

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
            return 0
        })

        return result
    }, [coursesArray, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCourses = filteredAndSortedCourses.slice(startIndex, endIndex)

    // Reset to first page when filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Courses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">Loading courses...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Courses Management</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search and Items Per Page */}
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Items per page:</span>
                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center p-0 hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => handleSort("title")}
                                    >
                                        Course Title
                                        {getSortIcon("title")}
                                    </Button>
                                </TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center p-0 hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => handleSort("teacherName")}
                                    >
                                        Teacher
                                        {getSortIcon("teacherName")}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-center">
                                    <Button
                                        variant="ghost"
                                        className="flex items-center mx-auto p-0 hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => handleSort("enrolledCount")}
                                    >
                                        Students
                                        {getSortIcon("enrolledCount")}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center p-0 hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => handleSort("createdAt")}
                                    >
                                        Created
                                        {getSortIcon("createdAt")}
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No courses found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {course.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {course.teacherName || "Unknown"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{course.enrolledCount ?? 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(course.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {filteredAndSortedCourses.length > 0 && (
                    <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
