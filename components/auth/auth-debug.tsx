"use client"

import { useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const checkUser = async () => {
    setLoading(true)
    try {
      const supabase = createClientSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("User check error:", error)
        setUserInfo({ error: error.message })
      } else {
        setUserInfo(data)
      }
    } catch (err) {
      console.error("Unexpected error checking user:", err)
      setUserInfo({ error: "Unexpected error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Auth Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">User Status:</h3>
            <div className="bg-muted p-2 rounded-md mt-2 text-xs overflow-auto max-h-32">
              {loading ? (
                "Loading..."
              ) : userInfo?.error ? (
                <span className="text-red-500">{userInfo.error}</span>
              ) : userInfo?.user ? (
                <pre>{JSON.stringify(userInfo.user, null, 2)}</pre>
              ) : (
                "No user found"
              )}
            </div>
          </div>

          <Button onClick={checkUser} size="sm">
            Refresh User Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
