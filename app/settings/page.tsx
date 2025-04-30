import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null // Middleware will handle redirect
  }

  const userId = session.user.id

  try {
    const settings = await getSettings(userId)

    return (
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1 container py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
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
