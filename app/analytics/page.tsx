import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AnalyticsContent } from "@/components/analytics/analytics-content"
import { createServerSupabaseClientWithAuth } from "@/lib/supabase/server"

export default async function AnalyticsPage() {
  try {
    const { supabase, user } = await createServerSupabaseClientWithAuth()

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (tasksError) {
      throw tasksError
    }

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (settingsError) {
      throw settingsError
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 container py-6 flex justify-center mx-auto">
          <div className="w-full max-w-4xl">
            <AnalyticsContent tasks={tasks} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      redirect("/signin")
    }
    
    console.error("Error loading analytics data:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Error loading analytics. Please try again later.</p>
      </div>
    )
  }
}
