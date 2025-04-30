import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSettings } from "@/app/actions/settings"
import { Header } from "@/components/header"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

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
