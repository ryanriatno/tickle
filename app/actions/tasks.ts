"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { InsertTables, UpdateTables } from "@/lib/types/database.types"

export async function getTasks(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    throw new Error("Failed to fetch tasks")
  }

  return data
}

export async function createTask(task: InsertTables<"tasks">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("tasks").insert(task).select().single()

  if (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }

  revalidatePath("/dashboard")
  return data
}

export async function updateTask(id: string, updates: UpdateTables<"tasks">) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
  }

  revalidatePath("/dashboard")
  return data
}

export async function deleteTask(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    throw new Error("Failed to delete task")
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function incrementCompletedPomodoros(id: string) {
  const supabase = createServerSupabaseClient()

  // First get the current task
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("completed_pomodoros")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching task:", fetchError)
    throw new Error("Failed to fetch task")
  }

  // Then update the completed_pomodoros count
  const { data, error } = await supabase
    .from("tasks")
    .update({
      completed_pomodoros: task.completed_pomodoros + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
  }

  revalidatePath("/dashboard")
  return data
}
