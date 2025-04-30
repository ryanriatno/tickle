"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CookieDebug() {
  const [cookieInfo, setCookieInfo] = useState<string>("")

  const checkCookies = () => {
    setCookieInfo(document.cookie || "No cookies found")
  }

  useEffect(() => {
    checkCookies()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Cookie Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Cookie Status:</h3>
            <div className="bg-muted p-2 rounded-md mt-2 text-xs overflow-auto max-h-32">
              {cookieInfo ? cookieInfo : "No cookies found"}
            </div>
          </div>

          <Button onClick={checkCookies} size="sm">
            Refresh Cookie Info
          </Button>

          <div className="text-xs text-muted-foreground mt-4">
            <p>If you don't see any Supabase cookies:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Check if third-party cookies are enabled</li>
              <li>Try using a different browser</li>
              <li>Check if you're in incognito/private mode</li>
              <li>Clear your browser cache and cookies</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
