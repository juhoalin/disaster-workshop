"use client"

import { useState, useEffect } from "react"
import { Post } from "@/components/post"
import { CreatePost } from "@/components/create-post"
import type { PostType } from "@/lib/types"
import { getPosts, savePosts } from "@/lib/store"

export function Feed() {
  const [posts, setPosts] = useState<PostType[]>([])

  useEffect(() => {
    setPosts(getPosts())
  }, [])

  const addPost = (newPost: PostType) => {
    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)
    savePosts(updatedPosts)
  }

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}")
        const hasLiked = post.likes.includes(userData.nickname)
        return {
          ...post,
          likes: hasLiked
            ? post.likes.filter((user) => user !== userData.nickname)
            : [...post.likes, userData.nickname],
        }
      }
      return post
    })
    setPosts(updatedPosts)
    savePosts(updatedPosts)
  }

  const addComment = (postId: string, comment: PostType["comments"][0]) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, comment],
        }
      }
      return post
    })
    setPosts(updatedPosts)
    savePosts(updatedPosts)
  }

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={addPost} />
      {posts.map((post) => (
        <Post key={post.id} post={post} onLike={handleLike} onComment={addComment} />
      ))}
    </div>
  )
}

