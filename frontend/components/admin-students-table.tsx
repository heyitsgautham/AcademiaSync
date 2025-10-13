"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserCog, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, RefreshCw, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Student {
    id: number
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    age?: number
    avgScore?: number
    enrolledCourses?: number
}

interface AdminStudentsTableProps {
    students: Student[]
    isLoading: boolean
    onUpdate: () => void
    onEdit: (student: Student) => void
    onDelete: (studentId: number) => void
}

type SortField = "name" | "email" | "avgScore" | "enrolledCourses"
type SortOrder = "asc" | "desc"

export function AdminStudentsTable({ students, isLoading, onUpdate, onEdit, onDelete }: AdminStudentsTableProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [promoteUserId, setPromoteUserId] = useState<number | null>(null)
    const [promoteRole, setPromoteRole] = useState<"Teacher" | "Admin" | null>(null)
    const [isPromoting, setIsPromoting] = useState(false)
    const [specializationDialogOpen, setSpecializationDialogOpen] = useState(false)
    const [specialization, setSpecialization] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false)
    const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const studentsArray = Array.isArray(students) ? students : []

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

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let result = studentsArray.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesSearch
        })

        // Sort students
        result.sort((a, b) => {
            let aValue: any
            let bValue: any

            if (sortField === "name") {
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
            } else if (sortField === "avgScore") {
                aValue = a.avgScore ?? 0
                bValue = b.avgScore ?? 0
            } else if (sortField === "enrolledCourses") {
                aValue = a.enrolledCourses ?? 0
                bValue = b.enrolledCourses ?? 0
            } else {
                aValue = a[sortField as keyof Student]
                bValue = b[sortField as keyof Student]
            }

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
    }, [studentsArray, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStudents = filteredAndSortedStudents.slice(startIndex, endIndex)

    // Reset to first page when filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1)
    }

    const handlePromoteClick = (userId: number, role: "Teacher" | "Admin") => {
        setPromoteUserId(userId)
        setPromoteRole(role)

        // If promoting to Teacher, show specialization dialog
        if (role === "Teacher") {
            setSpecializationDialogOpen(true)
        }
    }

    const handlePromoteConfirm = async () => {
        if (!promoteUserId || !promoteRole) return

        // If promoting to Teacher and no specialization provided yet
        if (promoteRole === "Teacher" && !specialization) {
            setSpecializationDialogOpen(true)
            return
        }

        setIsPromoting(true)
        try {
            const response = await fetch("/api/admin/promote-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: promoteUserId,
                    newRole: promoteRole,
                    specialization: promoteRole === "Teacher" ? specialization : undefined,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to promote user")
            }

            toast({
                title: "Success",
                description: `User promoted to ${promoteRole} successfully`,
            })

            onUpdate()
            setPromoteUserId(null)
            setPromoteRole(null)
            setSpecialization("")
            setSpecializationDialogOpen(false)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsPromoting(false)
        }
    }

    const handleSpecializationSubmit = () => {
        if (!specialization.trim()) {
            toast({
                title: "Error",
                description: "Specialization is required for teachers",
                variant: "destructive",
            })
            return
        }
        setSpecializationDialogOpen(false)
        handlePromoteConfirm()
    }

    const handleDelete = async () => {
        if (!deleteStudentId) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/admin/students/${deleteStudentId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete student")
            }

            toast({
                title: "Success",
                description: "Student deleted successfully",
            })

            onDelete(deleteStudentId)
            setDeleteStudentId(null)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">Loading students...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Students Management</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search and Items Per Page */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
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

                    {/* Students Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center p-0 hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => handleSort("name")}
                                        >
                                            Name
                                            {getSortIcon("name")}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center p-0 hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => handleSort("email")}
                                        >
                                            Email
                                            {getSortIcon("email")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center mx-auto p-0 hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => handleSort("avgScore")}
                                        >
                                            Avg Score
                                            {getSortIcon("avgScore")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center mx-auto p-0 hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => handleSort("enrolledCourses")}
                                        >
                                            Courses
                                            {getSortIcon("enrolledCourses")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">Change Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <TableRow
                                            key={student.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={(e) => {
                                                // Don't navigate if clicking on buttons
                                                if ((e.target as HTMLElement).closest('button')) {
                                                    return
                                                }
                                                router.push(`/admin/students/${student.id}`)
                                            }}
                                        >
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.profilePicture || undefined} alt={`${student.firstName} ${student.lastName}`} />
                                                    <AvatarFallback>
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {student.firstName} {student.lastName}
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell className="text-center">
                                                {student.avgScore ? (
                                                    <Badge variant="outline">{parseFloat(student.avgScore.toString()).toFixed(1)}%</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">{student.enrolledCourses ?? 0}</TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPromoteUserId(student.id)
                                                        setRoleChangeDialogOpen(true)
                                                    }}
                                                    className="gap-2"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    Update
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => onEdit(student)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteStudentId(student.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredAndSortedStudents.length > 0 && (
                        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
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

            {/* Role Change Selection Dialog */}
            <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                        <DialogDescription>
                            Select the new role for this student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                handlePromoteClick(promoteUserId!, "Teacher")
                                setRoleChangeDialogOpen(false)
                            }}
                        >
                            <UserCog className="h-4 w-4" />
                            Promote to Teacher
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                handlePromoteClick(promoteUserId!, "Admin")
                                setRoleChangeDialogOpen(false)
                            }}
                        >
                            <Shield className="h-4 w-4" />
                            Promote to Admin
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Specialization Dialog (for Teacher promotion) */}
            <Dialog open={specializationDialogOpen} onOpenChange={setSpecializationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Specialization</DialogTitle>
                        <DialogDescription>
                            Please provide a specialization for the new teacher role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization *</Label>
                            <Input
                                id="specialization"
                                placeholder="e.g., Computer Science, Mathematics"
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSpecializationDialogOpen(false)
                                setPromoteUserId(null)
                                setPromoteRole(null)
                                setSpecialization("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSpecializationSubmit}>Continue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Promote Confirmation Dialog (for Admin promotion) */}
            <AlertDialog
                open={!!promoteUserId && promoteRole === "Admin" && !specializationDialogOpen}
                onOpenChange={() => {
                    setPromoteUserId(null)
                    setPromoteRole(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Promote to {promoteRole}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will change the user's role to {promoteRole}. They will gain {promoteRole === "Admin" ? "full administrative" : "teaching"} privileges.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPromoting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePromoteConfirm} disabled={isPromoting}>
                            {isPromoting ? "Promoting..." : "Promote"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteStudentId} onOpenChange={() => setDeleteStudentId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this student and all associated data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
