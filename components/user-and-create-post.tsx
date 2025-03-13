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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleBadgeStyle,
} from "@/lib/user-roles";
import type { PostType } from "@/lib/types";
import { Input } from "@/components/ui/input";

interface UserAndCreatePostProps {
    onPostCreated: (post: PostType) => Promise<void>;
}

const MAX_POST_LENGTH = 280;

export function UserAndCreatePost({ onPostCreated }: UserAndCreatePostProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nickname, setNickname] = useState("");
    const { user, login } = useUser();

    const charactersLeft = MAX_POST_LENGTH - content.length;
    const isOverLimit = charactersLeft < 0;

    // Handle joining with a nickname
    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim() && user) {
            // Only update the nickname, preserve the role from user context
            login({ nickname: nickname.trim(), role: user.role });
        }
    };

    // Handle creating a new post
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user || !content.trim() || isOverLimit) return;

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

    // Helper function to get user initials for the avatar
    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    if (!user) {
        // Show join form if no user is logged in
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Join the conversation</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Your nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="submit"
                                disabled={!nickname.trim()}
                                className="flex-1"
                            >
                                Join
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    // Get user display info
    const displayName = ROLE_DISPLAY_NAMES[user.role as UserRole];
    const badgeText = BADGE_DISPLAY_TEXT[user.role as UserRole] || user.role;
    const roleImageName = user.role.toLowerCase();

    return (
        <Card className="mb-6 bg-gray-50">
            {/* User profile section */}
            <CardHeader className="pb-2">
                <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                <div className="flex items-center gap-4 pb-4">
                    <Avatar className="h-14 w-14">
                        <AvatarImage
                            src={`/profile-images/${roleImageName}.jpg`}
                            alt={displayName}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-lg">
                            {getInitials(user.nickname)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-xl">{displayName}</p>
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full text-xs",
                                getRoleBadgeStyle(user.role)
                            )}
                        >
                            {badgeText}
                        </span>
                    </div>
                </div>
            </CardHeader>

            {/* Separator line */}
            <div className="h-px bg-gray-200 mx-6"></div>

            {/* Create post section */}
            <form onSubmit={handleSubmit}>
                <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-base">Create a post</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Textarea
                            placeholder="What's happening?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={3}
                            maxLength={MAX_POST_LENGTH}
                            className={isOverLimit ? "border-red-500" : ""}
                        />
                        <div className="flex justify-end">
                            <span
                                className={`text-sm ${
                                    isOverLimit
                                        ? "text-red-500 font-semibold"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {charactersLeft} characters left
                            </span>
                        </div>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-4">
                    <Button
                        type="submit"
                        disabled={
                            !content.trim() || isSubmitting || isOverLimit
                        }
                    >
                        {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
