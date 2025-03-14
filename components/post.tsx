"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardHeader, CardFooter } from "@/components/ui/card";
import type { PostType } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleCardBackground,
    getRoleBadgeStyle,
    USER_ROLES,
} from "@/lib/user-roles";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    MentionInput,
    RenderContentWithMentions,
} from "@/components/ui/mention-input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    onDeletePost: (postId: string) => Promise<void>;
    onDeleteComment: (postId: string, commentId: string) => Promise<void>;
}

// Add a new ClientSideTime component that only renders on the client
function ClientSideTime({ timestamp }: { timestamp: Date }) {
    const [formattedTime, setFormattedTime] = useState<string>("");

    useEffect(() => {
        // Format the date on client side
        const formatted = formatDistanceToNow(timestamp, { addSuffix: true });

        // Make the timestamp display shorter and more concise
        const shortenedTime = formatted
            .replace("about ", "")
            .replace("less than a minute ago", "just now")
            .replace(" minute ago", "m ago")
            .replace(" minutes ago", "m ago")
            .replace(" hour ago", "h ago")
            .replace(" hours ago", "h ago")
            .replace(" day ago", "d ago")
            .replace(" days ago", "d ago");

        setFormattedTime(shortenedTime);
    }, [timestamp]);

    // Return nothing until the effect runs on client
    if (!formattedTime) {
        return <span className="text-xs text-muted-foreground">...</span>;
    }

    return (
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
    );
}

export function Post({
    post,
    onLike,
    onComment,
    onDeletePost,
    onDeleteComment,
}: PostProps) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const { user } = useUser();

    const charactersLeft = MAX_COMMENT_LENGTH - commentText.length;
    const isOverLimit = charactersLeft < 0;

    // Check if any user with the current user's role has already liked the post
    const hasLiked = user
        ? post.likes.some((like) => {
              // Handle new format likes (role:nickname)
              if (like.includes(":")) {
                  const [likeRole] = like.split(":");
                  return likeRole === user.role;
              }

              // Handle old format likes - check if liker is post author with same role
              if (like === post.author && post.authorRole === user.role) {
                  return true;
              }

              // Check if liker has commented with the same role
              const comment = post.comments.find((c) => c.author === like);
              if (comment && comment.authorRole === user.role) {
                  return true;
              }

              // Check if like is the current user's nickname
              return like === user.nickname;
          })
        : false;

    // Get lowercase role name for image mapping for likes popover
    const getLikerRoleImage = (likerName: string) => {
        try {
            // Handle the new format with role:nickname
            if (likerName.includes(":")) {
                const [role] = likerName.split(":");
                // Ensure role is valid and lowercase
                return (role || "other").toLowerCase();
            }

            // For old format likes - check if liker is the post author
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
        } catch (err) {
            console.error("Error getting liker role image:", err);
            return "other";
        }
    };

    // Get the role for a liker
    const getLikerRole = (likerName: string): UserRole => {
        try {
            // Handle the new format with role:nickname
            if (likerName.includes(":")) {
                const [role] = likerName.split(":");
                // Check if it's a valid role
                if (
                    role &&
                    Object.values(USER_ROLES).includes(role as UserRole)
                ) {
                    return role as UserRole;
                }
                return "Other";
            }

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
        } catch (err) {
            console.error("Error getting liker role:", err);
            return "Other";
        }
    };

    // Get display name for a liker
    const getLikerDisplayName = (likerName: string): string => {
        try {
            // Handle the new format with role:nickname
            if (likerName.includes(":")) {
                const [role, nickname] = likerName.split(":");

                // Use the role display name or fallback to the nickname
                return (
                    ROLE_DISPLAY_NAMES[role as UserRole] ||
                    nickname ||
                    likerName
                );
            }

            const role = getLikerRole(likerName);

            // If the nickname matches a display name, it's likely a user who should keep their nickname
            if (Object.values(ROLE_DISPLAY_NAMES).includes(likerName)) {
                return likerName;
            }

            // Return the role-based display name or fallback to the nickname
            return ROLE_DISPLAY_NAMES[role] || likerName;
        } catch (err) {
            console.error("Error getting liker display name:", err);
            return likerName || "Unknown User";
        }
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
        if (!name) return "??";

        // For names with spaces (like "Government Official"), use first letters of each word
        if (name.includes(" ")) {
            return name
                .split(" ")
                .map((part) => part.charAt(0))
                .join("")
                .toUpperCase()
                .substring(0, 2);
        }

        // For single names, use the first two characters
        return name.substring(0, 2).toUpperCase();
    };

    // Get the display name for the post author
    const authorDisplayName =
        ROLE_DISPLAY_NAMES[post.authorRole as UserRole] || post.author;

    // Get the badge display text
    const badgeText =
        BADGE_DISPLAY_TEXT[post.authorRole as UserRole] || post.authorRole;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const roleBackground = getRoleCardBackground(post.authorRole);

    // Get lowercase role name for image path
    const roleImageName = post.authorRole.toLowerCase();

    const handleDeletePost = async () => {
        if (!user) return;
        await onDeletePost(post.id);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;
        await onDeleteComment(post.id, commentId);
    };

    // Check if current user has the same role as the post author
    const canDeletePost = user ? user.role === post.authorRole : false;

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
                <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between w-full">
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
                        </div>
                        <div className="flex items-center gap-2">
                            <ClientSideTime timestamp={post.timestamp} />

                            {/* Delete Post Button - Only show for users with the same role */}
                            {canDeletePost && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive px-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete Post
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete
                                                this post? This action cannot be
                                                undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeletePost}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                    <p>
                        <RenderContentWithMentions content={post.content} />
                    </p>
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
                                                                alt={getLikerDisplayName(
                                                                    liker
                                                                )}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback>
                                                                {getInitials(
                                                                    getLikerDisplayName(
                                                                        liker
                                                                    )
                                                                )}
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
                                    // Check if user has the same role as the comment author
                                    const canDeleteComment = user
                                        ? user.role === comment.authorRole
                                        : false;

                                    // Get the comment author display name
                                    const commentAuthorDisplayName =
                                        ROLE_DISPLAY_NAMES[
                                            comment.authorRole as UserRole
                                        ] || comment.author;

                                    const commentRoleImageName =
                                        comment.authorRole.toLowerCase();
                                    const commentBadgeText =
                                        BADGE_DISPLAY_TEXT[
                                            comment.authorRole as UserRole
                                        ] || comment.authorRole;

                                    return (
                                        <div
                                            key={comment.id}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                    src={`/profile-images/${commentRoleImageName}.jpg`}
                                                    alt={
                                                        commentAuthorDisplayName
                                                    }
                                                    className="object-cover"
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        comment.author
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-0.5">
                                                    <span className="font-medium text-base">
                                                        {
                                                            commentAuthorDisplayName
                                                        }
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "role-badge text-[8px] py-1 px-1.5 inline-flex items-center leading-none h-[20px] align-middle",
                                                            getRoleBadgeStyle(
                                                                comment.authorRole
                                                            )
                                                        )}
                                                    >
                                                        {commentBadgeText}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        <ClientSideTime
                                                            timestamp={
                                                                comment.timestamp
                                                            }
                                                        />
                                                    </span>

                                                    {/* Delete Comment Button - Only show for users with the same role */}
                                                    {canDeleteComment && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-muted-foreground hover:text-destructive h-4 w-4 p-0 ml-1"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Delete
                                                                        Comment
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you
                                                                        sure you
                                                                        want to
                                                                        delete
                                                                        this
                                                                        comment?
                                                                        This
                                                                        action
                                                                        cannot
                                                                        be
                                                                        undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDeleteComment(
                                                                                comment.id
                                                                            )
                                                                        }
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                                <p>
                                                    <RenderContentWithMentions
                                                        content={
                                                            comment.content
                                                        }
                                                    />
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
                                    <MentionInput
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={setCommentText}
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
