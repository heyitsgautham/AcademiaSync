"use client"

import { useState } from "react"
import { useTableControls } from "@/hooks/use-table-controls"
import { SortableHeader, TablePagination, TableToolbar } from "@/components/data-table-controls"
import type { SortValue } from "@/lib/table"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, GraduationCap, Users as UsersIcon, RefreshCw, User } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { errorMessage } from "@/lib/errors"

export interface Teacher {
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

const SORT_VALUES: Record<SortField, (r: Teacher) => SortValue> = {
    name: (r) => `${r.firstName} ${r.lastName}`,
    email: (r) => r.email,
    courseCount: (r) => r.courseCount ?? 0,
    studentCount: (r) => r.studentCount ?? 0,
}
const SEARCH_FIELDS = (r: Teacher) => [r.firstName, r.lastName, r.email, r.specialization]

export function AdminTeachersTable({ teachers, isLoading, onEdit, onDelete }: AdminTeachersTableProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [deleteTeacherId, setDeleteTeacherId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [roleChangeTeacherId, setRoleChangeTeacherId] = useState<number | null>(null)
    const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false)
    const [selectedRoleChange, setSelectedRoleChange] = useState<"Student" | "Admin" | null>(null)
    const [isChangingRole, setIsChangingRole] = useState(false)

    const table = useTableControls<Teacher, SortField>(teachers, {
        searchFields: SEARCH_FIELDS,
        sortValues: SORT_VALUES,
        initialSort: "name",
    })

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
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: errorMessage(error),
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
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: errorMessage(error),
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
                    <TableToolbar
                        searchPlaceholder="Search teachers..."
                        searchQuery={table.searchQuery}
                        onSearchChange={table.setSearchQuery}
                        perPage={table.perPage}
                        onPerPageChange={table.setPerPage}
                    />

                    {/* Teachers Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>
                                        <SortableHeader label="Name" field="name" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} />
                                    </TableHead>
                                    <TableHead>
                                        <SortableHeader label="Email" field="email" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} />
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <SortableHeader label="Courses" field="courseCount" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} centered />
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <SortableHeader label="Students" field="studentCount" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} centered />
                                    </TableHead>
                                    <TableHead className="text-center">Change Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {table.rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No teachers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.rows.map((teacher) => (
                                        <TableRow
                                            key={teacher.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={(e) => {
                                                // Don't navigate if clicking on buttons
                                                if ((e.target as HTMLElement).closest('button')) {
                                                    return
                                                }
                                                router.push(`/admin/teachers/${teacher.id}`)
                                            }}
                                        >
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

                    <TablePagination
                        page={table.page}
                        totalPages={table.totalPages}
                        startIndex={table.startIndex}
                        endIndex={table.endIndex}
                        total={table.filteredCount}
                        noun="teachers"
                        onPageChange={table.setPage}
                    />
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
                            This will change the user&apos;s role to {selectedRoleChange}.
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
