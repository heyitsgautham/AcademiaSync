"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserCog, Shield } from "lucide-react"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Student {
    id: number
    firstName: string
    lastName: string
    email: string
    age?: number
    enrolledCourses?: number
}

interface AdminStudentsTableProps {
    students: Student[]
    isLoading: boolean
    onUpdate: () => void
}

export function AdminStudentsTable({ students, isLoading, onUpdate }: AdminStudentsTableProps) {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [promoteUserId, setPromoteUserId] = useState<number | null>(null)
    const [promoteRole, setPromoteRole] = useState<"Teacher" | "Admin" | null>(null)
    const [isPromoting, setIsPromoting] = useState(false)
    const [specializationDialogOpen, setSpecializationDialogOpen] = useState(false)
    const [specialization, setSpecialization] = useState("")

    const studentsArray = Array.isArray(students) ? students : []

    // Filter students
    const filteredStudents = studentsArray.filter((student) => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesSearch
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
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="text-center">Age</TableHead>
                                    <TableHead className="text-center">Courses</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">
                                                {student.firstName} {student.lastName}
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell className="text-center">
                                                {student.age ? <Badge variant="outline">{student.age} years</Badge> : "-"}
                                            </TableCell>
                                            <TableCell className="text-center">{student.enrolledCourses ?? 0}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePromoteClick(student.id, "Teacher")}
                                                        className="gap-2"
                                                    >
                                                        <UserCog className="h-4 w-4" />
                                                        Promote to Teacher
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePromoteClick(student.id, "Admin")}
                                                        className="gap-2"
                                                    >
                                                        <Shield className="h-4 w-4" />
                                                        Promote to Admin
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredStudents.length > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground">
                            Showing {filteredStudents.length} of {studentsArray.length} students
                        </div>
                    )}
                </CardContent>
            </Card>

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
        </>
    )
}
