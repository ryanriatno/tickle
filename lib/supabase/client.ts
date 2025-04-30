import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

let client: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (client) return client

  client = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  return client
}
