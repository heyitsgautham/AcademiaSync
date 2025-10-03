"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function DashboardTopbar() {
  const { data: session } = useSession()
  const router = useRouter()

  // Construct full name from firstName and lastName
  const firstName = session?.user?.firstName || ""
  const lastName = session?.user?.lastName || ""
  const userName = firstName && lastName ? `${firstName} ${lastName}` : session?.user?.name || "User"
  const userEmail = session?.user?.email || ""
  const userImage = session?.user?.image || "/placeholder-user.jpg"

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const handleSettings = () => {
    router.push("/teacher/settings")
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg hover:bg-muted px-2 py-1.5 transition-colors">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">Teacher</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
