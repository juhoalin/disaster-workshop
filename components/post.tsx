"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PostType } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    getRoleCardBackground,
    getRoleBadgeStyle,
} from "@/lib/user-roles";

interface PostProps {
    post: PostType;
    onLike: (postId: string) => Promise<void>;
    onComment: (
        postId: string,
        comment: {
            id: string;
            author: string;
            content: string;
            timestamp: Date;
            authorRole: UserRole;
        }
    ) => Promise<void>;
}

// Add a new ClientSideTime component that only renders on the client
function ClientSideTime({ timestamp }: { timestamp: Date }) {
    const [formattedTime, setFormattedTime] = useState<string>("");

    useEffect(() => {
        // Only format the date on the client side
        setFormattedTime(formatDistanceToNow(timestamp, { addSuffix: true }));
    }, [timestamp]);

    // Return nothing until the effect runs on client
    if (!formattedTime) {
        return <span className="text-xs text-muted-foreground ml-2">...</span>;
    }

    return (
        <span className="text-xs text-muted-foreground ml-2">
            {formattedTime}
        </span>
    );
}

export function Post({ post, onLike, onComment }: PostProps) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const { user, isChangingUser } = useUser();

    const hasLiked = user ? post.likes.includes(user.nickname) : false;

    const handleLikeClick = async () => {
        if (!user || isChangingUser) return;

        try {
            setIsLiking(true);
            await onLike(post.id);
        } catch (err) {
            console.error("Error liking post:", err);
        } finally {
            setIsLiking(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !commentText.trim() || isChangingUser) return;

        try {
            setIsSubmitting(true);

            await onComment(post.id, {
                id: crypto.randomUUID(),
                author: user.nickname,
                content: commentText.trim(),
                timestamp: new Date(),
                authorRole: user.role,
            });

            setCommentText("");
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    console.log("Post author role:", post.authorRole);
    console.log(
        "Role card background class:",
        getRoleCardBackground(post.authorRole)
    );
    console.log("Role badge style class:", getRoleBadgeStyle(post.authorRole));

    // Get the background color class for the user's role
    const roleBackground = getRoleCardBackground(post.authorRole);

    return (
        <div className={cn("rounded-xl border shadow", roleBackground)}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar>
                    <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <div className="flex items-center">
                        <span className="font-semibold">{post.author}</span>
                        <span
                            className={cn(
                                "text-xs ml-2 px-2 py-0.5 rounded-full",
                                getRoleBadgeStyle(post.authorRole)
                            )}
                        >
                            {post.authorRole}
                        </span>
                        {/* Replace direct date formatting with client-side component */}
                        <ClientSideTime timestamp={post.timestamp} />
                    </div>
                    <p>{post.content}</p>
                </div>
            </CardHeader>
            <CardFooter className="flex flex-col border-t pt-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={handleLikeClick}
                            disabled={!user || isChangingUser || isLiking}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4",
                                    hasLiked ? "fill-red-500 text-red-500" : ""
                                )}
                            />
                            <span>{post.likes.length}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => setShowComments(!showComments)}
                        >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments.length}</span>
                        </Button>
                    </div>
                </div>

                {showComments && (
                    <div className="w-full mt-4 space-y-4">
                        {post.comments.length > 0 && (
                            <div className="space-y-3">
                                {post.comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="flex items-start gap-2"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(comment.author)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <span className="text-sm font-semibold">
                                                    {comment.author}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "text-xs ml-1 px-1.5 py-0.5 rounded-full",
                                                        getRoleBadgeStyle(
                                                            comment.authorRole
                                                        )
                                                    )}
                                                >
                                                    {comment.authorRole}
                                                </span>
                                                {/* Use the ClientSideTime component for comment timestamps too */}
                                                <ClientSideTime
                                                    timestamp={
                                                        comment.timestamp
                                                    }
                                                />
                                            </div>
                                            <p className="text-sm mt-0.5">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {user ? (
                            <form
                                onSubmit={handleSubmitComment}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) =>
                                        setCommentText(e.target.value)
                                    }
                                    className="flex-1"
                                    disabled={isSubmitting || isChangingUser}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={
                                        !commentText.trim() ||
                                        isSubmitting ||
                                        isChangingUser
                                    }
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">
                                            ...
                                        </span>
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Set a nickname to comment
                            </p>
                        )}
                    </div>
                )}
            </CardFooter>
        </div>
    );
}
