import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTasks } from "@/app/actions/tasks"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"
import type { Database } from "@/lib/types/database.types"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name: string, value: string, options: any) {
          await cookieStore.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        },
        async remove(name: string, options: any) {
          await cookieStore.set(name, '', {
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
    const [tasks, settings] = await Promise.all([getTasks(userId), getSettings(userId)])

    return (
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 container py-6 flex justify-center mx-auto">
          <div className="w-full max-w-4xl">
            <DashboardContent tasks={tasks} settings={settings} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading dashboard data:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Error loading dashboard. Please try again later.</p>
      </div>
    )
  }
}
