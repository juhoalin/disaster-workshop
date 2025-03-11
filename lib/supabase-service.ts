import { getSupabase } from "./supabase";
import type { PostType } from "./types";

// Interface for database comment structure
interface DbComment {
    id: string;
    author: string;
    author_role: string;
    content: string;
    timestamp: string;
}

// Interface for database post structure
interface DbPost {
    id: string;
    author: string;
    author_role: string;
    content: string;
    timestamp: string;
    likes: string[];
    comments: DbComment[];
}

// Interface for objects with string keys
interface StringKeyObject {
    [key: string]: unknown;
}

// Helper function to convert camelCase to snake_case for Supabase
// This function is kept for potential future use
/* eslint-disable @typescript-eslint/no-unused-vars */
function toSnakeCase(obj: StringKeyObject): StringKeyObject {
    const result: StringKeyObject = {};

    Object.keys(obj).forEach((key) => {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        // Handle nested objects but not Date objects
        if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !(obj[key] instanceof Date) &&
            !Array.isArray(obj[key])
        ) {
            result[snakeKey] = toSnakeCase(obj[key] as StringKeyObject);
        } else {
            result[snakeKey] = obj[key];
        }
    });

    return result;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// Helper function to convert snake_case back to camelCase for our app
function toCamelCase(obj: StringKeyObject): StringKeyObject {
    const result: StringKeyObject = {};

    Object.keys(obj).forEach((key) => {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase()
        );

        // Handle nested objects
        if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !(obj[key] instanceof Date)
        ) {
            result[camelKey] = Array.isArray(obj[key])
                ? (obj[key] as unknown[]).map((item) =>
                      typeof item === "object" && item !== null
                          ? toCamelCase(item as StringKeyObject)
                          : item
                  )
                : toCamelCase(obj[key] as StringKeyObject);
        } else {
            result[camelKey] = obj[key];
        }
    });

    return result;
}

// Posts Collection
export async function fetchPosts(): Promise<PostType[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("timestamp", { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        return [];
    }

    if (!data || data.length === 0) {
        return [];
    }

    // Process the data to ensure timestamps are Date objects and convert to camelCase
    // Cast the data array to the correct type before mapping
    return (data as unknown as DbPost[]).map((post) => {
        // First convert keys from snake_case to camelCase
        const camelPost = toCamelCase(post as unknown as StringKeyObject);

        // Process dates and nested objects
        return {
            ...camelPost,
            timestamp: new Date(post.timestamp),
            // Handle comments properly - it's a jsonb[] in the database
            comments: Array.isArray(post.comments)
                ? post.comments.map((comment: DbComment) => ({
                      ...toCamelCase(comment as unknown as StringKeyObject),
                      timestamp: new Date(comment.timestamp),
                  }))
                : [],
        } as PostType;
    });
}

export async function createPost(post: PostType): Promise<PostType | null> {
    const supabase = getSupabase();

    try {
        // Convert to snake_case for Supabase and handle Date objects
        const postForDb = {
            // Use actual database column names
            id: post.id,
            author: post.author,
            author_role: post.authorRole, // Convert camelCase to snake_case
            content: post.content,
            timestamp: post.timestamp.toISOString(),
            likes: post.likes || [],
            // Ensure comments is properly formatted for jsonb[]
            comments: post.comments.map((comment) => ({
                id: comment.id,
                author: comment.author,
                author_role: comment.authorRole, // Convert camelCase to snake_case
                content: comment.content,
                timestamp: comment.timestamp.toISOString(),
            })),
        };

        console.log(
            "Sending post data to Supabase:",
            JSON.stringify(postForDb)
        );

        const { data, error } = await supabase
            .from("posts")
            .insert(postForDb)
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return null;
        }

        if (!data) {
            console.error("No data returned from insert");
            return null;
        }

        // Cast the returned data to DbPost to ensure TypeScript knows the structure
        const dbPost = data as DbPost;

        // Convert back to our app format
        return {
            id: dbPost.id,
            author: dbPost.author,
            authorRole: dbPost.author_role, // Convert snake_case back to camelCase
            content: dbPost.content,
            timestamp: new Date(dbPost.timestamp),
            likes: dbPost.likes || [],
            comments: Array.isArray(dbPost.comments)
                ? dbPost.comments.map((comment: DbComment) => ({
                      id: comment.id,
                      author: comment.author,
                      authorRole: comment.author_role, // Convert snake_case back to camelCase
                      content: comment.content,
                      timestamp: new Date(comment.timestamp),
                  }))
                : [],
        } as PostType;
    } catch (err) {
        console.error("Exception in createPost:", err);
        throw err;
    }
}

export async function updatePostLikes(
    postId: string,
    likes: string[]
): Promise<boolean> {
    const supabase = getSupabase();

    try {
        const { error } = await supabase
            .from("posts")
            .update({ likes })
            .eq("id", postId);

        if (error) {
            console.error("Error updating post likes:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Exception in updatePostLikes:", err);
        return false;
    }
}

export async function addCommentToPost(
    postId: string,
    comment: {
        id: string;
        author: string;
        authorRole: string;
        content: string;
        timestamp: Date;
    }
): Promise<boolean> {
    const supabase = getSupabase();

    try {
        // First get the current post to access its comments
        const { data: post, error: fetchError } = await supabase
            .from("posts")
            .select("comments")
            .eq("id", postId)
            .single();

        if (fetchError) {
            console.error("Error fetching post for comment:", fetchError);
            return false;
        }

        // Prepare the comment for storage (convert to snake_case and ISO string)
        const commentForDb = {
            id: comment.id,
            author: comment.author,
            author_role: comment.authorRole, // Convert camelCase to snake_case
            content: comment.content,
            timestamp: comment.timestamp.toISOString(),
        };

        // Add the new comment to the existing comments
        // Handle the case where comments might be null or not an array
        const currentComments = Array.isArray(post.comments)
            ? post.comments
            : [];
        const updatedComments = [...currentComments, commentForDb];

        // Update the post with the new comments array
        const { error: updateError } = await supabase
            .from("posts")
            .update({ comments: updatedComments })
            .eq("id", postId);

        if (updateError) {
            console.error("Error adding comment to post:", updateError);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Exception in addCommentToPost:", err);
        return false;
    }
}
