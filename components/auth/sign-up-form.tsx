"use client"

import { useState } from "react"
import { signUp } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Sign Up"}
    </Button>
  )
}

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setMessage(null)

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    try {
      const result = await signUp(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setMessage(result.success)
      }
    } catch (err) {
      console.error("Sign up error:", err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(null)
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setPasswordError(null)
              }}
              required
            />
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/signin" className="text-sm text-primary hover:underline">
          Already have an account? Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
