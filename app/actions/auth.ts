"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email to confirm your account." }
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect("/signin")
}
