"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { PostType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PostProps {
  post: PostType
  onLike: (postId: string) => void
  onComment: (
    postId: string,
    comment: { id: string; author: string; content: string; timestamp: Date; authorRole?: string },
  ) => void
}

export function Post({ post, onLike, onComment }: PostProps) {
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-50 dark:bg-red-950/30"
      case "Moderator":
        return "bg-green-50 dark:bg-green-950/30"
      case "VIP":
        return "bg-purple-50 dark:bg-purple-950/30"
      default:
        return ""
    }
  }

  const userDataString = localStorage.getItem("userData")
  const currentUser = userDataString ? JSON.parse(userDataString).nickname : null
  const hasLiked = currentUser ? post.likes.includes(currentUser) : false

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const userDataString = localStorage.getItem("userData")
    if (!userDataString) return

    try {
      const userData = JSON.parse(userDataString)

      const newComment = {
        id: crypto.randomUUID(),
        author: userData.nickname,
        authorRole: userData.role,
        content: commentText.trim(),
        timestamp: new Date(),
      }

      onComment(post.id, newComment)
      setCommentText("")
    } catch (error) {
      console.error("Error creating comment:", error)
    }
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className={cn(getRoleColor(post.authorRole))}>
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
                post.authorRole === "Admin"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : post.authorRole === "Moderator"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : post.authorRole === "VIP"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
              )}
            >
              {post.authorRole}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDistanceToNow(post.timestamp, { addSuffix: true })}
            </span>
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
              onClick={() => onLike(post.id)}
              disabled={!currentUser}
            >
              <Heart className={cn("h-4 w-4", hasLiked ? "fill-red-500 text-red-500" : "")} />
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
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{getInitials(comment.author)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("p-2 rounded-md text-sm flex-1", getRoleColor(comment.authorRole))}>
                      <div className="font-medium flex items-center">
                        {comment.author}
                        <span
                          className={cn(
                            "text-xs ml-2 px-1.5 py-0.5 rounded-full text-xs",
                            comment.authorRole === "Admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : comment.authorRole === "Moderator"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : comment.authorRole === "VIP"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                          )}
                        >
                          {comment.authorRole}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!commentText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Set a nickname to comment</p>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

