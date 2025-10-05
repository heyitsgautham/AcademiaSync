"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, GraduationCap, Users as UsersIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

export function AdminTeachersTable({ teachers, isLoading, onEdit, onDelete }: AdminTeachersTableProps) {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [specializationFilter, setSpecializationFilter] = useState("all")
    const [deleteTeacherId, setDeleteTeacherId] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const teachersArray = Array.isArray(teachers) ? teachers : []

    // Get unique specializations for filter
    const specializations = Array.from(new Set(teachersArray.map((t) => t.specialization).filter(Boolean)))

    // Filter teachers
    const filteredTeachers = teachersArray.filter((teacher) => {
        const matchesSearch =
            teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesSpecialization =
            specializationFilter === "all" || teacher.specialization === specializationFilter

        return matchesSearch && matchesSpecialization
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
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specializations</SelectItem>
                                {specializations.map((spec) => (
                                    <SelectItem key={spec} value={spec}>
                                        {spec}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Teachers Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead className="text-center">Courses</TableHead>
                                    <TableHead className="text-center">Students</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No teachers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="font-medium">
                                                {teacher.firstName} {teacher.lastName}
                                            </TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {teacher.specialization}
                                                </Badge>
                                            </TableCell>
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

                    {filteredTeachers.length > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filteredTeachers.length} of {teachersArray.length} teachers
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
        </>
    )
}
