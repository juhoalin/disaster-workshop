import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



let supabase: ReturnType<typeof createClient> | null = null;

if (typeof supabaseUrl === "string" && typeof supabaseAnonKey === "string") {
    try {
        if (!supabaseUrl.startsWith("https://")) {
            throw new Error("Supabase URL must start with https://");
        }

        if (supabaseUrl === supabaseAnonKey) {
            throw new Error(
                "Supabase URL and Anon Key cannot be identical. Please check your .env.local file."
            );
        }

        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
            },
        });
        console.log("Supabase client created successfully");
    } catch (error) {
        console.error("Error creating Supabase client:", error);
    }
} else {
    console.error(
        "Invalid Supabase URL or Anon Key. Please check your environment variables."
    );
}

export function getSupabase() {
    if (!supabase) {
        throw new Error(
            "Supabase client is not initialized. Please check your environment variables and Supabase configuration."
        );
    }
    return supabase;
}
