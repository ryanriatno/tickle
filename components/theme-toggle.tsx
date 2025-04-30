"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { updateSettings } from "@/app/actions/settings"
import type { Tables } from "@/lib/types/database.types"
import { useEffect } from "react"

interface ThemeToggleProps {
  settings: Tables<"settings">
}

export function ThemeToggle({ settings }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    try {
      await updateSettings(settings.user_id, {
        dark_mode: newTheme === "dark",
      })
    } catch (error) {
      console.error("Failed to update theme preference:", error)
    }
  }

  // Set initial theme based on user settings
  useEffect(() => {
    setTheme(settings.dark_mode ? "dark" : "light")
  }, [settings.dark_mode, setTheme])

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
