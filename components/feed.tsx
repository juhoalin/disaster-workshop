"use client";

import { useState, useEffect } from "react";
import { Post } from "@/components/post";
import { CreatePost } from "@/components/create-post";
import type { PostType, UserRole } from "@/lib/types";
import { getUser } from "@/lib/store";
import {
    fetchPosts,
    createPost,
    updatePostLikes,
    addCommentToPost,
} from "@/lib/supabase-service";

export function Feed() {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    }, []);

    const addPost = async (newPost: PostType) => {
        try {
            const createdPost = await createPost(newPost);
            if (createdPost) {
                setPosts([createdPost, ...posts]);
            }
        } catch (err) {
            console.error("Failed to create post:", err);
            // For better UX, you might want to show an error toast/message
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const post = posts.find((p) => p.id === postId);
            if (!post) return;

            const userData = getUser();
            if (!userData) return;

            const hasLiked = post.likes.includes(userData.nickname);
            const updatedLikes = hasLiked
                ? post.likes.filter((user) => user !== userData.nickname)
                : [...post.likes, userData.nickname];

            // Optimistic UI update
            const updatedPosts = posts.map((p) =>
                p.id === postId ? { ...p, likes: updatedLikes } : p
            );
            setPosts(updatedPosts);

            // Persist to Supabase
            const success = await updatePostLikes(postId, updatedLikes);
            if (!success) {
                // Revert optimistic update on failure
                setPosts(posts);
            }
        } catch (err) {
            console.error("Failed to update likes:", err);
            // Revert optimistic update on error
            setPosts(posts);
        }
    };

    const addComment = async (
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
            // Optimistic UI update
            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, comment],
                    };
                }
                return post;
            });
            setPosts(updatedPosts);

            // Persist to Supabase
            const success = await addCommentToPost(postId, comment);
            if (!success) {
                // Revert optimistic update on failure
                setPosts(posts);
            }
        } catch (err) {
            console.error("Failed to add comment:", err);
            // Revert optimistic update on error
            setPosts(posts);
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading posts...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <CreatePost onPostCreated={addPost} />
            {posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={addComment}
                />
            ))}
        </div>
    );
}
