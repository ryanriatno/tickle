import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings/settings-form"
import type { Database } from "@/lib/types/database.types"

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', {
            ...options,
            maxAge: 0,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  const userId = user.id

  try {
    const settings = await getSettings(userId)

    return (
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 container py-6 flex justify-center mx-auto">
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <SettingsForm settings={settings} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading settings:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Error loading settings. Please try again later.</p>
      </div>
    )
  }
}
