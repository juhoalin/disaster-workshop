// This script helps initialize the Supabase database
// Run with: node init-supabase.js

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

// Import our user roles - note: require is used because this is a Node.js script
// We're requiring the compiled JS file, not the TS file
const userRoles = require("./lib/user-roles.js");

async function initSupabase() {
    console.log("Starting Supabase initialization...");

    // Get credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials in .env.local");
        process.exit(1);
    }

    console.log(`Connecting to Supabase at ${supabaseUrl}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Simple connection test
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .limit(1);

        if (error && error.code === "42P01") {
            console.log("Posts table does not exist yet, creating schema...");

            // If this is a "relation does not exist" error, we need to create the table
            // Read the SQL file
            const schema = fs.readFileSync("supabase-schema.sql", "utf8");

            // Execute each SQL statement
            const statements = schema
                .split(";")
                .filter((stmt) => stmt.trim().length > 0);

            for (const stmt of statements) {
                console.log(`Executing: ${stmt.trim().substring(0, 60)}...`);
                const { error } = await supabase.rpc("exec_sql", {
                    query: stmt.trim(),
                });

                if (error) {
                    console.error("SQL execution error:", error);
                    // Continue with other statements even if one fails
                }
            }

            console.log("Schema creation completed!");
        } else if (error) {
            console.error("Error connecting to Supabase:", error);
        } else {
            console.log("Successfully connected to Supabase!");
            console.log("Current post count:", data.length);
        }

        // Create a sample post
        const samplePost = {
            id: crypto.randomUUID(),
            author: "System",
            authorRole: "Government", // This should match a value from USER_ROLES
            content:
                "Welcome to the application! This is an automatically generated first post.",
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [],
        };

        const { error: insertError } = await supabase
            .from("posts")
            .insert(samplePost);

        if (insertError) {
            console.error("Error creating sample post:", insertError);
        } else {
            console.log("Sample post created successfully!");
        }
    } catch (err) {
        console.error("Exception during Supabase initialization:", err);
    }
}

initSupabase().catch(console.error);
