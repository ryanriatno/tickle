"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    setLoading(true)
    try {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session check error:", error)
        setSessionInfo({ error: error.message })
      } else {
        setSessionInfo(data)
      }
    } catch (err) {
      console.error("Unexpected error checking session:", err)
      setSessionInfo({ error: "Unexpected error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Session Status:</h3>
            <p>{loading ? "Checking..." : sessionInfo?.session ? "Authenticated" : "Not authenticated"}</p>
          </div>

          {!loading && sessionInfo?.session && (
            <div>
              <h3 className="font-medium">User ID:</h3>
              <p className="text-sm break-all">{sessionInfo.session.user.id}</p>

              <h3 className="font-medium mt-2">Email:</h3>
              <p className="text-sm">{sessionInfo.session.user.email}</p>
            </div>
          )}

          {!loading && sessionInfo?.error && (
            <div>
              <h3 className="font-medium text-red-500">Error:</h3>
              <p className="text-sm text-red-500">{sessionInfo.error}</p>
            </div>
          )}

          <Button onClick={checkSession} disabled={loading}>
            {loading ? "Checking..." : "Refresh Session Info"}
          </Button>

          <div className="text-xs text-muted-foreground mt-4">
            <p>If you're experiencing authentication issues:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Make sure cookies are enabled in your browser</li>
              <li>Try clearing your browser cache and cookies</li>
              <li>Check if you're using the correct email and password</li>
              <li>Try using a different browser</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
