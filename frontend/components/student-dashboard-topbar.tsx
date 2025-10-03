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

export function StudentDashboardTopbar() {
  const { data: session } = useSession()
  type UserWithProfilePic = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string | null;
    image?: string | null;
    profilePicture?: string;
  };
  const user = session?.user as UserWithProfilePic | undefined;
  const router = useRouter()

  // Construct full name from firstName and lastName
  const firstName = user?.firstName || ""
  const lastName = user?.lastName || ""
  let userName = "User";
  if (firstName && lastName) {
    userName = `${firstName} ${lastName}`;
  } else if (firstName) {
    userName = firstName;
  } else if (user?.name) {
    userName = user.name;
  }
  const userEmail = user?.email || ""
  const profilePicture = user?.image || user?.profilePicture
  const userImage = profilePicture && profilePicture !== "" ? profilePicture : undefined;

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
    router.push("/student/settings")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Spacer for left side on mobile */}
      <div className="flex-1 md:flex-none" />

      {/* Right side: Theme toggle and Profile */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg hover:bg-muted px-2 py-1.5 transition-colors">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
            <Avatar className="h-9 w-9">
              {userImage ? (
                <AvatarImage 
                  src={userImage} 
                  alt={userName}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(userName)}</AvatarFallback>
              )}
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
    </header>
  )
}
