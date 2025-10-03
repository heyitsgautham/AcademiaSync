"use client"

import { useState } from "react"
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
import { BookOpen, LogOut, Menu, Settings, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { StudentDashboardSidebar } from "./student-dashboard-sidebar"

export function StudentDashboardTopbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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
    <>
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <Link href="/student/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">AcademiaSync</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-sidebar-foreground"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation */}
          <div onClick={() => setMobileMenuOpen(false)}>
            <StudentDashboardSidebar />
          </div>
          
          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <p className="text-xs text-muted-foreground">© AcademiaSync 2025</p>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden md:block flex-1" />

        {/* Right side: Theme toggle and Profile */}
        <div className="flex items-center gap-4 ml-auto">
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
    </>
  )
}

