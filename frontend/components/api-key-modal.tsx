"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Shield, Timer } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiKeyModalProps {
    isOpen: boolean
    onValidate: (apiKey: string) => Promise<boolean>
    onSuccess: () => void
}

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 // seconds

export function ApiKeyModal({ isOpen, onValidate, onSuccess }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState("")
    const [failedAttempts, setFailedAttempts] = useState(0)
    const [isLockedOut, setIsLockedOut] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)

    // Check for existing lockout on mount
    useEffect(() => {
        const lockoutEnd = sessionStorage.getItem("api_key_lockout_end")
        const attempts = sessionStorage.getItem("api_key_failed_attempts")

        if (attempts) {
            setFailedAttempts(parseInt(attempts))
        }

        if (lockoutEnd) {
            const endTime = parseInt(lockoutEnd)
            const now = Date.now()
            
            if (endTime > now) {
                setIsLockedOut(true)
                setRemainingTime(Math.ceil((endTime - now) / 1000))
            } else {
                // Lockout expired, clear it
                sessionStorage.removeItem("api_key_lockout_end")
                sessionStorage.removeItem("api_key_failed_attempts")
                setFailedAttempts(0)
            }
        }
    }, [])

    // Countdown timer effect
    useEffect(() => {
        if (!isLockedOut || remainingTime <= 0) return

        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    setIsLockedOut(false)
                    setFailedAttempts(0)
                    sessionStorage.removeItem("api_key_lockout_end")
                    sessionStorage.removeItem("api_key_failed_attempts")
                    setError("")
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isLockedOut, remainingTime])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        
        // Check if locked out
        if (isLockedOut) {
            setError(`Too many failed attempts. Please wait ${remainingTime} seconds.`)
            return
        }

        setIsValidating(true)

        try {
            // Basic format validation
            if (!apiKey.trim()) {
                setError("API key is required")
                return
            }

            if (apiKey.length < 10) {
                setError("API key must be at least 10 characters long")
                return
            }

            // Validate with server
            const isValid = await onValidate(apiKey)

            if (isValid) {
                // Store validation status in sessionStorage
                sessionStorage.setItem("analytics_api_key_valid", "true")
                sessionStorage.setItem("analytics_api_key_timestamp", Date.now().toString())
                // Clear failed attempts on success
                sessionStorage.removeItem("api_key_failed_attempts")
                sessionStorage.removeItem("api_key_lockout_end")
                setFailedAttempts(0)
                onSuccess()
            } else {
                // Increment failed attempts
                const newAttempts = failedAttempts + 1
                setFailedAttempts(newAttempts)
                sessionStorage.setItem("api_key_failed_attempts", newAttempts.toString())

                if (newAttempts >= MAX_ATTEMPTS) {
                    // Lock out the user
                    const lockoutEnd = Date.now() + (LOCKOUT_DURATION * 1000)
                    sessionStorage.setItem("api_key_lockout_end", lockoutEnd.toString())
                    setIsLockedOut(true)
                    setRemainingTime(LOCKOUT_DURATION)
                    setError(`Too many failed attempts. Locked out for ${LOCKOUT_DURATION} seconds.`)
                } else {
                    const attemptsRemaining = MAX_ATTEMPTS - newAttempts
                    setError(`Invalid API key. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`)
                }
            }
        } catch (err) {
            setError("Failed to validate API key. Please try again.")
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <DialogTitle>Analytics Access Required</DialogTitle>
                    </div>
                    <DialogDescription>
                        To access the analytics dashboard, please enter the API key for additional security verification.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder="Enter analytics API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={isValidating || isLockedOut}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isLockedOut && (
                        <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                            <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <AlertDescription className="text-orange-800 dark:text-orange-200">
                                Account temporarily locked. Time remaining: <strong>{remainingTime}s</strong>
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isLockedOut && failedAttempts > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Failed attempts: {failedAttempts}/{MAX_ATTEMPTS}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="submit"
                            disabled={isValidating || !apiKey.trim() || isLockedOut}
                            className="min-w-[100px]"
                        >
                            {isValidating ? "Validating..." : "Access Analytics"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}