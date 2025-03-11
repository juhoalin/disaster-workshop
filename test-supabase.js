// Simple script to test Supabase connectivity
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function testSupabase() {
    // Get credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Supabase URL:", supabaseUrl);
    console.log("Key available:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
        console.error("Error: Missing Supabase credentials in .env.local");
        return;
    }

    try {
        console.log("Creating Supabase client...");
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("Testing connection...");
        const { data, error } = await supabase.from("posts").select("count");

        if (error) {
            if (error.code === "42P01") {
                console.log(
                    "The posts table does not exist yet. We need to create it."
                );
            } else {
                console.error("Error connecting to Supabase:", error);
            }
        } else {
            console.log("Successfully connected to Supabase!", data);
        }

        // Try to create a simple table
        console.log("Testing table creation capability...");
        const { error: sqlError } = await supabase.rpc("exec_sql", {
            query: "CREATE TABLE IF NOT EXISTS test_table (id serial primary key, name text)",
        });

        if (sqlError) {
            console.error("Cannot create tables directly. Error:", sqlError);
            console.log(
                "You may need to create tables through the Supabase dashboard."
            );
        } else {
            console.log("Successfully created test table!");
        }
    } catch (err) {
        console.error("Exception during Supabase test:", err);
    }
}

testSupabase().catch(console.error);
