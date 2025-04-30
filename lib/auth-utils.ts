import { createClientSupabaseClient } from "./supabase/client"

export async function getCurrentUser() {
  const supabase = createClientSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function signOut() {
  const supabase = createClientSupabaseClient()

  try {
    await supabase.auth.signOut()
    // Force a hard navigation to ensure the page is fully reloaded
    window.location.href = "/signin"
  } catch (error) {
    console.error("Error signing out:", error)
  }
}
