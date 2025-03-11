"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { PostType } from "@/lib/types";
import { useUser } from "@/lib/user-context";

interface CreatePostProps {
    onPostCreated: (post: PostType) => Promise<void>;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, isChangingUser } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user || !content.trim() || isChangingUser) return;

        setIsSubmitting(true);

        try {
            const newPost: PostType = {
                id: crypto.randomUUID(),
                author: user.nickname,
                authorRole: user.role,
                content: content.trim(),
                timestamp: new Date(),
                likes: [],
                comments: [],
            };

            await onPostCreated(newPost);
            setContent("");
        } catch (err) {
            console.error("Failed to create post:", err);
            setError("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't render if no user or if user is changing
    if (!user || isChangingUser) {
        return null;
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-base">Create a post</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="What's happening?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={3}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                    <Button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
