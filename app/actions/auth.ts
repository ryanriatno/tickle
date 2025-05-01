"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: "/dashboard" }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const cookieStore = await cookies()
  const supabase = createServerClient(
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
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  return { success: true, redirect: "/signin" }
}
