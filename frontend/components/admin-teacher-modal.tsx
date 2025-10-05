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

interface Teacher {
    id: number
    firstName: string
    lastName: string
    email: string
    specialization: string
}

interface AdminTeacherModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacher?: Teacher | null
    onSuccess: () => void
    mode: "create" | "edit"
}

interface TeacherFormData {
    firstName: string
    lastName: string
    email: string
    specialization: string
    password?: string
}

export function AdminTeacherModal({ open, onOpenChange, teacher, onSuccess, mode }: AdminTeacherModalProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const teacherSchema = yup.object({
        firstName: yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
        lastName: yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
        email: yup.string().required("Email is required").email("Please enter a valid email address"),
        specialization: yup.string().required("Specialization is required").min(2, "Specialization must be at least 2 characters"),
        password: yup.string().when([], {
            is: () => mode === "create",
            then: (schema) => schema.required("Password is required for new teachers").min(6, "Password must be at least 6 characters"),
            otherwise: (schema) => schema.optional(),
        }),
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<yup.InferType<typeof teacherSchema>>({
        resolver: yupResolver(teacherSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            specialization: "",
            password: "",
        },
    })

    useEffect(() => {
        if (teacher && mode === "edit") {
            reset({
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                specialization: teacher.specialization,
            })
        } else {
            reset({
                firstName: "",
                lastName: "",
                email: "",
                specialization: "",
                password: "",
            })
        }
    }, [teacher, mode, reset])

    const onSubmit = async (data: yup.InferType<typeof teacherSchema>) => {
        setIsSubmitting(true)

        try {
            const url = mode === "create" ? "/api/admin/teachers" : `/api/admin/teachers/${teacher?.id}`
            const method = mode === "create" ? "POST" : "PUT"

            const body: any = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                specialization: data.specialization,
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
                throw new Error(error.error || "Failed to save teacher")
            }

            toast({
                title: "Success",
                description: mode === "create" ? "Teacher created successfully" : "Teacher updated successfully",
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
                    <DialogTitle>{mode === "create" ? "Create New Teacher" : "Edit Teacher"}</DialogTitle>
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
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Input
                            id="specialization"
                            {...register("specialization", { required: "Specialization is required" })}
                            placeholder="Computer Science"
                        />
                        {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
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
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create Teacher" : "Update Teacher"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
