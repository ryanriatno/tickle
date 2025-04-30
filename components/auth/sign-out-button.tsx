"use client"

import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useTransition } from "react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignOutButton({ variant = "ghost" }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <Button variant={variant} onClick={handleSignOut} disabled={isPending}>
      {isPending ? (
        "Signing out..."
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </>
      )}
    </Button>
  )
}
