import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTasks } from "@/app/actions/tasks"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // Middleware will handle redirect
  }

  const userId = session.user.id

  try {
    const [tasks, settings] = await Promise.all([getTasks(userId), getSettings(userId)])

    return (
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 container py-6">
          <DashboardContent tasks={tasks} settings={settings} />
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
