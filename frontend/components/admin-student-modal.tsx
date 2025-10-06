"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Student {
    id: number
    firstName: string
    lastName: string
    email: string
    age?: number
}

interface AdminStudentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    student?: Student | null
    onSuccess: () => void
    mode: "create" | "edit"
}

interface StudentFormData {
    firstName: string
    lastName: string
    email: string
    age?: number
    password?: string
}

export function AdminStudentModal({ open, onOpenChange, student, onSuccess, mode }: AdminStudentModalProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const studentSchema = yup.object({
        firstName: yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
        lastName: yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
        email: yup.string().required("Email is required").email("Please enter a valid email address"),
        age: yup.number().positive("Age must be positive").integer("Age must be an integer").optional(),
        password: yup.string().when([], {
            is: () => mode === "create",
            then: (schema) => schema.required("Password is required for new students").min(6, "Password must be at least 6 characters"),
            otherwise: (schema) => schema.optional(),
        }),
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<yup.InferType<typeof studentSchema>>({
        resolver: yupResolver(studentSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            age: undefined,
            password: "",
        },
    })

    useEffect(() => {
        if (student && mode === "edit") {
            reset({
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                age: student.age,
            })
        } else {
            reset({
                firstName: "",
                lastName: "",
                email: "",
                age: undefined,
                password: "",
            })
        }
    }, [student, mode, reset])

    const onSubmit = async (data: yup.InferType<typeof studentSchema>) => {
        setIsSubmitting(true)

        try {
            const url = mode === "create" ? "/api/admin/students" : `/api/admin/students/${student?.id}`
            const method = mode === "create" ? "POST" : "PUT"

            const body: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                age: data.age || null,
            }

            // Only include password for create mode
            if (mode === "create" && data.password) {
                body.password = data.password
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to save student")
            }

            toast({
                title: "Success",
                description: mode === "create" ? "Student created successfully" : "Student updated successfully",
            })

            onSuccess()
            onOpenChange(false)
            reset()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Create New Student" : "Edit Student"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                {...register("firstName", { required: "First name is required" })}
                                placeholder="John"
                            />
                            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input id="lastName" {...register("lastName", { required: "Last name is required" })} placeholder="Doe" />
                            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address",
                                },
                            })}
                            placeholder="john.doe@example.com"
                            disabled={mode === "edit"}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            {...register("age", { valueAsNumber: true })}
                            placeholder="18"
                        />
                        {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                    </div>

                    {mode === "create" && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password", {
                                    required: mode === "create" ? "Password is required" : false,
                                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                                })}
                                placeholder="Enter password"
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
