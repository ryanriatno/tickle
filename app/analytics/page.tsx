import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTasks } from "@/app/actions/tasks"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"

export default async function AnalyticsPage() {
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
          <AnalyticsContent tasks={tasks} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error loading analytics data:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Error loading analytics. Please try again later.</p>
      </div>
    )
  }
}
