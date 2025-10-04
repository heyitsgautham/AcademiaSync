import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

const USER_SERVICE_URL = process.env.INTERNAL_BACKEND_URL || "http://user-service:5000"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id } = params

        const response = await fetch(`${USER_SERVICE_URL}/admin/teachers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.error || "Failed to update teacher" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error updating teacher:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.backendAccessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params

        const response = await fetch(`${USER_SERVICE_URL}/admin/teachers/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${session.backendAccessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.error || "Failed to delete teacher" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error deleting teacher:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
