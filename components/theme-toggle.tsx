"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { updateSettings } from "@/app/actions/settings"
import type { Tables } from "@/lib/types/database.types"
import { useEffect, useState } from "react"

interface ThemeToggleProps {
  settings: Tables<"settings">
}

export function ThemeToggle({ settings }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const currentTheme = theme || "light"

  // Only show the theme toggle after mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = async () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    
    try {
      // Update server settings first
      await updateSettings(settings.user_id, {
        dark_mode: newTheme === "dark",
      })
      // Only update local theme if server update succeeds
      setTheme(newTheme)
    } catch (error) {
      console.error("Failed to update theme preference:", error)
    }
  }

  // Set initial theme based on user settings
  useEffect(() => {
    if (mounted) {
      setTheme(settings.dark_mode ? "dark" : "light")
    }
  }, [settings.dark_mode, setTheme, mounted])

  if (!mounted) {
    return null
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
