"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PostType } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleCardBackground,
    getRoleBadgeStyle,
} from "@/lib/user-roles";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const MAX_COMMENT_LENGTH = 280;

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
    const { user } = useUser();

    const charactersLeft = MAX_COMMENT_LENGTH - commentText.length;
    const isOverLimit = charactersLeft < 0;

    const hasLiked = user ? post.likes.includes(user.nickname) : false;

    // Get lowercase role name for image mapping for likes popover
    const getLikerRoleImage = (likerName: string) => {
        // Since we don't have direct access to all users' roles,
        // we can check if the liker is the post author
        if (likerName === post.author) {
            return post.authorRole.toLowerCase();
        }

        // Check if the liker has commented on the post
        const comment = post.comments.find((c) => c.author === likerName);
        if (comment) {
            return comment.authorRole.toLowerCase();
        }

        // If the current user has liked the post, use their role
        if (user && likerName === user.nickname) {
            return user.role.toLowerCase();
        }

        // Default if we can't determine the role
        return "other";
    };

    // Get the role for a liker
    const getLikerRole = (likerName: string): UserRole => {
        // Check if the liker is the post author
        if (likerName === post.author) {
            return post.authorRole as UserRole;
        }

        // Check if the liker has commented on the post
        const comment = post.comments.find((c) => c.author === likerName);
        if (comment) {
            return comment.authorRole as UserRole;
        }

        // If the current user has liked the post, use their role
        if (user && likerName === user.nickname) {
            return user.role;
        }

        // Default if we can't determine the role
        return "Other";
    };

    // Get display name for a liker
    const getLikerDisplayName = (likerName: string): string => {
        const role = getLikerRole(likerName);

        // If the nickname matches a display name, it's likely a user who should keep their nickname
        if (Object.values(ROLE_DISPLAY_NAMES).includes(likerName)) {
            return likerName;
        }

        // Return the role-based display name or fallback to the nickname
        return ROLE_DISPLAY_NAMES[role] || likerName;
    };

    const handleLikeClick = async () => {
        if (!user) return;

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

        if (!user || !commentText.trim() || isOverLimit) return;

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

    // Get the display name for the post author
    const authorDisplayName =
        ROLE_DISPLAY_NAMES[post.authorRole as UserRole] || post.author;

    // Get the badge display text
    const badgeText =
        BADGE_DISPLAY_TEXT[post.authorRole as UserRole] || post.authorRole;

    // Get the background color class for the post's role
    const roleBackground = getRoleCardBackground(post.authorRole);

    // Get lowercase role name for image path
    const roleImageName = post.authorRole.toLowerCase();

    return (
        <div className="rounded-xl border shadow bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 bg-transparent">
                <Avatar>
                    <AvatarImage
                        src={`/profile-images/${roleImageName}.jpg`}
                        alt={authorDisplayName}
                        className="object-cover"
                    />
                    <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <div className="flex items-center">
                        <span className="font-semibold">
                            {authorDisplayName}
                        </span>
                        <span
                            className={cn(
                                "role-badge ml-2",
                                getRoleBadgeStyle(post.authorRole)
                            )}
                        >
                            {badgeText}
                        </span>
                        <ClientSideTime timestamp={post.timestamp} />
                    </div>
                    <p>{post.content}</p>
                </div>
            </CardHeader>
            <CardFooter className="flex flex-col border-t pt-4 bg-transparent">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 pr-1"
                                onClick={handleLikeClick}
                                disabled={!user || isLiking}
                            >
                                <Heart
                                    className={cn(
                                        "h-4 w-4",
                                        hasLiked
                                            ? "fill-red-500 text-red-500"
                                            : ""
                                    )}
                                />
                                <span>{post.likes.length}</span>
                            </Button>

                            {post.likes.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="pl-0 text-muted-foreground hover:text-foreground underline-offset-4"
                                        >
                                            Likes
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0">
                                        <div className="p-4">
                                            <h4 className="font-medium mb-2">
                                                Liked by
                                            </h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {post.likes.map((liker) => (
                                                    <div
                                                        key={liker}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage
                                                                src={`/profile-images/${getLikerRoleImage(
                                                                    liker
                                                                )}.jpg`}
                                                                alt={liker}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback>
                                                                {liker
                                                                    .substring(
                                                                        0,
                                                                        2
                                                                    )
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">
                                                            {getLikerDisplayName(
                                                                liker
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
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
                                {post.comments.map((comment) => {
                                    // Get display name for comment author
                                    const commentAuthorDisplayName =
                                        ROLE_DISPLAY_NAMES[
                                            comment.authorRole as UserRole
                                        ] || comment.author;

                                    // Get badge text for comment
                                    const commentBadgeText =
                                        BADGE_DISPLAY_TEXT[
                                            comment.authorRole as UserRole
                                        ] || comment.authorRole;

                                    // Get lowercase role name for comment author image path
                                    const commentRoleImageName =
                                        comment.authorRole.toLowerCase();

                                    return (
                                        <div
                                            key={comment.id}
                                            className="flex items-start gap-2"
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                    src={`/profile-images/${commentRoleImageName}.jpg`}
                                                    alt={
                                                        commentAuthorDisplayName
                                                    }
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(
                                                        comment.author
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-semibold">
                                                        {
                                                            commentAuthorDisplayName
                                                        }
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "role-badge ml-1",
                                                            getRoleBadgeStyle(
                                                                comment.authorRole
                                                            )
                                                        )}
                                                    >
                                                        {commentBadgeText}
                                                    </span>
                                                    <ClientSideTime
                                                        timestamp={
                                                            comment.timestamp
                                                        }
                                                    />
                                                </div>
                                                <p className="text-sm mt-1">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {user ? (
                            <form
                                onSubmit={handleSubmitComment}
                                className="flex flex-col gap-2"
                            >
                                <div className="relative w-full">
                                    <Input
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) =>
                                            setCommentText(e.target.value)
                                        }
                                        className={cn(
                                            "flex-1",
                                            isOverLimit && "border-red-500"
                                        )}
                                        disabled={isSubmitting}
                                        maxLength={MAX_COMMENT_LENGTH}
                                    />
                                    <div className="flex justify-end mt-1">
                                        <span
                                            className={`text-xs ${
                                                isOverLimit
                                                    ? "text-red-500 font-semibold"
                                                    : "text-muted-foreground"
                                            }`}
                                        >
                                            {charactersLeft} characters left
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="self-end"
                                    disabled={
                                        !commentText.trim() ||
                                        isSubmitting ||
                                        isOverLimit
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
