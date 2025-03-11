export type UserRole = "User" | "Moderator" | "Admin" | "VIP"

export interface UserData {
  nickname: string
  role: UserRole
}

export interface PostType {
  id: string
  author: string
  authorRole: UserRole
  content: string
  timestamp: Date
  likes: string[]
  comments: {
    id: string
    author: string
    authorRole: UserRole
    content: string
    timestamp: Date
  }[]
}

