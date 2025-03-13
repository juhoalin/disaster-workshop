"use client";

import { useState, useEffect } from "react";
import { Post } from "@/components/post";
import { UserAndCreatePost } from "@/components/user-and-create-post";
import type { PostType } from "@/lib/types";
import { UserRole } from "@/lib/user-roles";
import { useUser } from "@/lib/user-context";
import {
    fetchPosts,
    createPost,
    updatePostLikes,
    addCommentToPost,
    subscribeToPostChanges,
    deletePost,
    deleteCommentFromPost,
} from "@/lib/supabase-service";

interface FeedProps {
    createInputId?: string;
}

export function Feed({ createInputId }: FeedProps = {}) {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        async function loadPosts() {
            try {
                setIsLoading(true);
                const fetchedPosts = await fetchPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Failed to load posts:", err);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }

        loadPosts();

        // Set up real-time subscription for posts
        const unsubscribe = subscribeToPostChanges(
            // Handle new posts
            (newPost) => {
                console.log("Received new post:", newPost);
                setPosts((currentPosts) =>
                    // Check if post already exists to avoid duplicates
                    currentPosts.some((p) => p.id === newPost.id)
                        ? currentPosts
                        : [newPost, ...currentPosts].sort(
                              (a, b) =>
                                  b.timestamp.getTime() - a.timestamp.getTime()
                          )
                );
            },
            // Handle updated posts
            (updatedPost) => {
                console.log("Received updated post:", updatedPost);
                setPosts((currentPosts) =>
                    currentPosts.map((post) =>
                        post.id === updatedPost.id ? updatedPost : post
                    )
                );
            },
            // Handle deleted posts
            (deletedPostId) => {
                console.log("Received deleted post:", deletedPostId);
                setPosts((currentPosts) =>
                    currentPosts.filter((post) => post.id !== deletedPostId)
                );
            }
        );

        // Clean up subscription when component unmounts or user changes
        return unsubscribe;
    }, [user]);

    const handlePostCreated = async (newPost: PostType) => {
        try {
            // Additional check to ensure user is still valid
            if (!user) return;

            const createdPost = await createPost(newPost);
            if (createdPost) {
                // Check if this post is already in the state (could be added by subscription)
                setPosts((currentPosts) => {
                    // If the post is already in the state, don't add it again
                    if (currentPosts.find((p) => p.id === createdPost.id)) {
                        return currentPosts;
                    }
                    // Otherwise add it to the beginning of the list
                    return [createdPost, ...currentPosts];
                });
            }
        } catch (err) {
            console.error("Failed to create post:", err);
            // For better UX, you might want to show an error toast/message
        }
    };

    const handleLike = async (postId: string) => {
        try {
            // Check if user exists and is not changing
            if (!user) return;

            const post = posts.find((p) => p.id === postId);
            if (!post) return;

            const hasLiked = post.likes.includes(user.nickname);
            const updatedLikes = hasLiked
                ? post.likes.filter((name) => name !== user.nickname)
                : [...post.likes, user.nickname];

            // Optimistic UI update
            setPosts((currentPosts) =>
                currentPosts.map((p) =>
                    p.id === postId ? { ...p, likes: updatedLikes } : p
                )
            );

            // Persist to Supabase
            const success = await updatePostLikes(postId, updatedLikes);
            if (!success) {
                // Revert optimistic update on failure
                setPosts((currentPosts) =>
                    currentPosts.map((p) =>
                        p.id === postId ? { ...p, likes: post.likes } : p
                    )
                );
            }
        } catch (err) {
            console.error("Failed to update likes:", err);
            // Find the current post again to revert to its original state
            const originalPost = posts.find((p) => p.id === postId);
            if (originalPost) {
                // Revert optimistic update on error
                setPosts((currentPosts) =>
                    currentPosts.map((p) =>
                        p.id === postId
                            ? { ...p, likes: originalPost.likes }
                            : p
                    )
                );
            }
        }
    };

    const handleComment = async (
        postId: string,
        comment: {
            id: string;
            author: string;
            content: string;
            timestamp: Date;
            authorRole: UserRole;
        }
    ) => {
        try {
            // Check if user exists and is not changing
            if (!user) return;

            // Find the current post
            const currentPost = posts.find((p) => p.id === postId);
            if (!currentPost) return;

            // Optimistic UI update
            setPosts((currentPosts) =>
                currentPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [...post.comments, comment],
                        };
                    }
                    return post;
                })
            );

            // Persist to Supabase
            const success = await addCommentToPost(postId, comment);
            if (!success) {
                // Revert optimistic update on failure
                setPosts((currentPosts) =>
                    currentPosts.map((post) => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                comments: currentPost.comments,
                            };
                        }
                        return post;
                    })
                );
            }
        } catch (err) {
            console.error("Failed to add comment:", err);
            // Find the current post again to revert to its original state
            const originalPost = posts.find((p) => p.id === postId);
            if (originalPost) {
                // Revert optimistic update on error
                setPosts((currentPosts) =>
                    currentPosts.map((post) => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                comments: originalPost.comments,
                            };
                        }
                        return post;
                    })
                );
            }
        }
    };

    const handleDeletePost = async (postId: string) => {
        try {
            // Check if user exists
            if (!user) return;

            // Find the post to be deleted
            const postToDelete = posts.find((p) => p.id === postId);
            if (!postToDelete) return;

            // Check if user has the same role as the post author
            if (postToDelete.authorRole !== user.role) {
                console.error("Not authorized to delete this post:", {
                    postAuthorRole: postToDelete.authorRole,
                    currentRole: user.role,
                    message: "You can only delete posts from your own role",
                });
                return;
            }

            // Optimistic UI update - remove the post from the list
            setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== postId)
            );

            // Persist to Supabase with user nickname AND role for authentication
            const success = await deletePost(postId, user.nickname, user.role);

            if (!success) {
                // Revert optimistic update on failure
                setPosts((currentPosts) => [...currentPosts, postToDelete]);
                // Sort by timestamp descending
                setPosts((currentPosts) =>
                    [...currentPosts].sort(
                        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
                    )
                );
            }
        } catch (err) {
            console.error("Error deleting post:", err);
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        try {
            // Check if user exists
            if (!user) return;

            // Find the post containing the comment
            const currentPost = posts.find((p) => p.id === postId);
            if (!currentPost) return;

            // Find the comment to be deleted
            const commentToDelete = currentPost.comments.find(
                (c) => c.id === commentId
            );
            if (!commentToDelete) return;

            // Check if user has the same role as the comment author
            if (commentToDelete.authorRole !== user.role) {
                console.error("Not authorized to delete this comment:", {
                    commentAuthorRole: commentToDelete.authorRole,
                    currentRole: user.role,
                    message: "You can only delete comments from your own role",
                });
                return;
            }

            // Save the original comments for potential rollback
            const originalComments = [...currentPost.comments];

            // Optimistic UI update
            setPosts((currentPosts) =>
                currentPosts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: post.comments.filter(
                                (c) => c.id !== commentId
                            ),
                        };
                    }
                    return post;
                })
            );

            // Persist to Supabase with user nickname AND role for authentication
            const success = await deleteCommentFromPost(
                postId,
                commentId,
                user.nickname,
                user.role
            );

            if (!success) {
                // Revert optimistic update on failure
                setPosts((currentPosts) =>
                    currentPosts.map((post) => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                comments: originalComments,
                            };
                        }
                        return post;
                    })
                );
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    return (
        <div className="space-y-6">
            <UserAndCreatePost
                onPostCreated={handlePostCreated}
                createInputId={createInputId}
            />

            {isLoading ? (
                <div className="text-center p-8">
                    <span className="text-muted-foreground">Loading...</span>
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500">{error}</div>
            ) : posts.length === 0 ? (
                <div className="text-center p-8">
                    <span className="text-muted-foreground">
                        No posts yet. Be the first to post!
                    </span>
                </div>
            ) : (
                posts
                    .sort(
                        (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime()
                    )
                    .map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                            onLike={handleLike}
                            onComment={handleComment}
                            onDeletePost={handleDeletePost}
                            onDeleteComment={handleDeleteComment}
                        />
                    ))
            )}
        </div>
    );
}
