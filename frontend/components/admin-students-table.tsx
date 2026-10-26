"use client"

import { useState } from "react"
import { useTableControls } from "@/hooks/use-table-controls"
import { SortableHeader, TablePagination, TableToolbar } from "@/components/data-table-controls"
import type { SortValue } from "@/lib/table"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserCog, Shield, Edit, Trash2, RefreshCw, User } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/errors"

export interface Student {
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

const SORT_VALUES: Record<SortField, (r: Student) => SortValue> = {
    name: (r) => `${r.firstName} ${r.lastName}`,
    email: (r) => r.email,
    avgScore: (r) => r.avgScore ?? 0,
    enrolledCourses: (r) => r.enrolledCourses ?? 0,
}
const SEARCH_FIELDS = (r: Student) => [r.firstName, r.lastName, r.email]

export function AdminStudentsTable({ students, isLoading, onUpdate, onEdit, onDelete }: AdminStudentsTableProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [promoteUserId, setPromoteUserId] = useState<number | null>(null)
    const [promoteRole, setPromoteRole] = useState<"Teacher" | "Admin" | null>(null)
    const [isPromoting, setIsPromoting] = useState(false)
    const [specializationDialogOpen, setSpecializationDialogOpen] = useState(false)
    const [specialization, setSpecialization] = useState("")
    const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false)
    const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const table = useTableControls<Student, SortField>(students, {
        searchFields: SEARCH_FIELDS,
        sortValues: SORT_VALUES,
        initialSort: "name",
    })

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
        } catch (error: unknown) {
            toast({
                title: "Error",
                description: errorMessage(error),
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
                    <TableToolbar
                        searchPlaceholder="Search students..."
                        searchQuery={table.searchQuery}
                        onSearchChange={table.setSearchQuery}
                        perPage={table.perPage}
                        onPerPageChange={table.setPerPage}
                    />

                    {/* Students Table */}
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
                                        <SortableHeader label="Avg Score" field="avgScore" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} centered />
                                    </TableHead>
                                    <TableHead className="text-center">
                                        <SortableHeader label="Courses" field="enrolledCourses" sortField={table.sortField} sortOrder={table.sortOrder} onSort={table.toggleSort} centered />
                                    </TableHead>
                                    <TableHead className="text-center">Change Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {table.rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    table.rows.map((student) => (
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

                    <TablePagination
                        page={table.page}
                        totalPages={table.totalPages}
                        startIndex={table.startIndex}
                        endIndex={table.endIndex}
                        total={table.filteredCount}
                        noun="students"
                        onPageChange={table.setPage}
                    />
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
                            This will change the user&apos;s role to {promoteRole}. They will gain {promoteRole === "Admin" ? "full administrative" : "teaching"} privileges.
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
