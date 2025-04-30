import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTasks } from "@/app/actions/tasks"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/signin")
  }

  const userId = session.user.id

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
