// Test script to verify post creation with correct column names
const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");
require("dotenv").config({ path: ".env.local" });

async function testFixedPost() {
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

        // Create a post with proper column naming
        const testPost = {
            id: randomUUID(),
            author: "Test User",
            author_role: "User", // Use snake_case to match DB schema
            content: "This is a test post with fixed column names",
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [], // This is a jsonb array
        };

        console.log("Creating post with correct schema:", testPost);

        const { data, error } = await supabase
            .from("posts")
            .insert(testPost)
            .select();

        if (error) {
            console.error("Error creating post:", error);
        } else {
            console.log("Successfully created post!", data);

            // Now try to fetch it back
            const { data: fetchedData, error: fetchError } = await supabase
                .from("posts")
                .select("*")
                .eq("id", testPost.id)
                .single();

            if (fetchError) {
                console.error("Error fetching post:", fetchError);
            } else {
                console.log("Successfully fetched post:", fetchedData);
            }
        }
    } catch (err) {
        console.error("Exception during test:", err);
    }
}

testFixedPost().catch(console.error);
