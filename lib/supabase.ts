import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Anon Key:", supabaseAnonKey ? "[REDACTED]" : "undefined")

let supabase: ReturnType<typeof createClient> | null = null

if (typeof supabaseUrl === "string" && typeof supabaseAnonKey === "string") {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client created successfully")
  } catch (error) {
    console.error("Error creating Supabase client:", error)
  }
} else {
  console.error("Invalid Supabase URL or Anon Key. Please check your environment variables.")
}

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase client is not initialized. Please check your environment variables and Supabase configuration.",
    )
  }
  return supabase
}

