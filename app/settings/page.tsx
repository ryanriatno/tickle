import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings/settings-form"
import { createServerSupabaseClientWithAuth } from "@/lib/supabase/server"

export default async function SettingsPage() {
  try {
    const { supabase, user } = await createServerSupabaseClientWithAuth()

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
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <SettingsForm settings={settings} />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Not authenticated') {
      redirect("/signin")
    }
    
    console.error("Error loading settings:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Error loading settings. Please try again later.</p>
      </div>
    )
  }
}
