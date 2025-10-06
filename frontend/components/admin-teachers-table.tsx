"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, GraduationCap, Users as UsersIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, User } from "lucide-react"
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

interface Teacher {
    id: number
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    specialization: string
    courseCount?: number
    studentCount?: number
}

interface AdminTeachersTableProps {
    teachers: Teacher[]
    isLoading: boolean
    onEdit: (teacher: Teacher) => void
    onDelete: (teacherId: number) => void
}

type SortField = "name" | "email" | "courseCount" | "studentCount"
type SortOrder = "asc" | "desc"

export function AdminTeachersTable({ teachers, isLoading, onEdit, onDelete }: AdminTeachersTableProps) {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteTeacherId, setDeleteTeacherId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [roleChangeTeacherId, setRoleChangeTeacherId] = useState<number | null>(null)
    const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false)
    const [selectedRoleChange, setSelectedRoleChange] = useState<"Student" | "Admin" | null>(null)
    const [isChangingRole, setIsChangingRole] = useState(false)

    const teachersArray = Array.isArray(teachers) ? teachers : []

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

    // Filter and sort teachers
    const filteredAndSortedTeachers = useMemo(() => {
        let result = teachersArray.filter((teacher) => {
            const matchesSearch =
                teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesSearch
        })

        // Sort teachers
        result.sort((a, b) => {
            let aValue: any
            let bValue: any

            if (sortField === "name") {
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
            } else if (sortField === "courseCount") {
                aValue = a.courseCount ?? 0
                bValue = b.courseCount ?? 0
            } else if (sortField === "studentCount") {
                aValue = a.studentCount ?? 0
                bValue = b.studentCount ?? 0
            } else {
                aValue = a[sortField as keyof Teacher]
                bValue = b[sortField as keyof Teacher]
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
    }, [teachersArray, searchQuery, sortField, sortOrder])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedTeachers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedTeachers = filteredAndSortedTeachers.slice(startIndex, endIndex)

    // Reset to first page when filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value))
        setCurrentPage(1)
    }

    const handleDelete = async () => {
        if (!deleteTeacherId) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/admin/teachers/${deleteTeacherId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to delete teacher")
            }

            toast({
                title: "Success",
                description: "Teacher deleted successfully",
            })

            onDelete(deleteTeacherId)
            setDeleteTeacherId(null)
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

    const handleRoleChange = async () => {
        if (!roleChangeTeacherId || !selectedRoleChange) return

        setIsChangingRole(true)
        try {
            const response = await fetch("/api/admin/change-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: roleChangeTeacherId,
                    newRole: selectedRoleChange,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to change role")
            }

            toast({
                title: "Success",
                description: `Role changed to ${selectedRoleChange} successfully`,
            })

            onDelete(roleChangeTeacherId) // Refresh the table
            setRoleChangeTeacherId(null)
            setSelectedRoleChange(null)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsChangingRole(false)
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">Loading teachers...</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Teachers Management</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search teachers..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Items:</span>
                            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-[80px]">
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

                    {/* Teachers Table */}
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
                                            onClick={() => handleSort("courseCount")}
                                        >
                                            Courses
                                            {getSortIcon("courseCount")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center mx-auto p-0 hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => handleSort("studentCount")}
                                        >
                                            Students
                                            {getSortIcon("studentCount")}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-center">Change Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No teachers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedTeachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell>
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={teacher.profilePicture || undefined} alt={`${teacher.firstName} ${teacher.lastName}`} />
                                                    <AvatarFallback>
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {teacher.firstName} {teacher.lastName}
                                            </TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                    <span>{teacher.courseCount ?? 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                                    <span>{teacher.studentCount ?? 0}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setRoleChangeTeacherId(teacher.id)
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
                                                    <Button variant="ghost" size="sm" onClick={() => onEdit(teacher)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteTeacherId(teacher.id)}
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
                    {filteredAndSortedTeachers.length > 0 && (
                        <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedTeachers.length)} of {filteredAndSortedTeachers.length} teachers
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTeacherId} onOpenChange={() => setDeleteTeacherId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this teacher and all associated data. This action cannot be undone.
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

            {/* Role Change Selection Dialog */}
            <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Role</DialogTitle>
                        <DialogDescription>
                            Select the new role for this teacher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                setSelectedRoleChange("Student")
                                setRoleChangeDialogOpen(false)
                            }}
                        >
                            Demote to Student
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => {
                                setSelectedRoleChange("Admin")
                                setRoleChangeDialogOpen(false)
                            }}
                        >
                            Promote to Admin
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Role Change Confirmation Dialog */}
            <AlertDialog
                open={!!selectedRoleChange}
                onOpenChange={() => {
                    setSelectedRoleChange(null)
                    setRoleChangeTeacherId(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedRoleChange === "Admin" ? "Promote to Admin?" : "Demote to Student?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will change the user's role to {selectedRoleChange}.
                            {selectedRoleChange === "Admin"
                                ? " They will gain full administrative privileges."
                                : " They will lose teaching privileges and become a student."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isChangingRole}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRoleChange} disabled={isChangingRole}>
                            {isChangingRole ? "Changing..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
