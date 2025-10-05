"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiKeyModalProps {
    isOpen: boolean
    onValidate: (apiKey: string) => Promise<boolean>
    onSuccess: () => void
}

export function ApiKeyModal({ isOpen, onValidate, onSuccess }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
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
                onSuccess()
            } else {
                setError("Invalid API key. Please check and try again.")
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
                            disabled={isValidating}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="submit"
                            disabled={isValidating || !apiKey.trim()}
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