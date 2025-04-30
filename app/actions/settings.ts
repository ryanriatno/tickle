"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { UpdateTables } from "@/lib/types/database.types"

export async function getSettings(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("settings").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching settings:", error)
    throw new Error("Failed to fetch settings")
  }

  return data
}

export async function updateSettings(userId: string, updates: UpdateTables<"settings">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("settings")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating settings:", error)
    throw new Error("Failed to update settings")
  }

  revalidatePath("/settings")
  return data
}
