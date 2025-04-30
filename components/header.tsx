import Link from "next/link"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Tables } from "@/lib/types/database.types"
import { Clock, Settings, ListTodo, BarChart } from "lucide-react"

interface HeaderProps {
  settings: Tables<"settings">
}

export function Header({ settings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard" className="flex items-center space-x-2 font-bold">
          <Clock className="h-6 w-6" />
          <span>Tickle</span>
        </Link>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            <ListTodo className="h-4 w-4 mr-1 inline" />
            Dashboard
          </Link>
          <Link
            href="/analytics"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <BarChart className="h-4 w-4 mr-1 inline" />
            Analytics
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Settings className="h-4 w-4 mr-1 inline" />
            Settings
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-2">
          <ThemeToggle settings={settings} />
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
