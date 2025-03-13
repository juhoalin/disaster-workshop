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
} from "@/lib/supabase-service";

export function Feed() {
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
                // Make sure we don't have duplicates
                setPosts((currentPosts) => {
                    if (currentPosts.find((p) => p.id === newPost.id)) {
                        return currentPosts;
                    }
                    return [newPost, ...currentPosts];
                });
            },
            // Handle updated posts
            (updatedPost) => {
                setPosts((currentPosts) =>
                    currentPosts.map((post) =>
                        post.id === updatedPost.id ? updatedPost : post
                    )
                );
            },
            // Handle deleted posts
            (deletedId) => {
                setPosts((currentPosts) =>
                    currentPosts.filter((post) => post.id !== deletedId)
                );
            }
        );

        // Clean up subscription when component unmounts
        return () => {
            unsubscribe();
        };
    }, []);

    const addPost = async (newPost: PostType) => {
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

    return (
        <div className="space-y-4">
            <UserAndCreatePost onPostCreated={addPost} />

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
                        />
                    ))
            )}
        </div>
    );
}
