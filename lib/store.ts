import type { PostType, UserData } from "./types"

const POSTS_STORAGE_KEY = "x_feed_posts"
const USER_STORAGE_KEY = "x_feed_user"

export function getPosts(): PostType[] {
  const postsJson = localStorage.getItem(POSTS_STORAGE_KEY)
  return postsJson ? JSON.parse(postsJson) : []
}

export function savePosts(posts: PostType[]): void {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts))
}

export function getUser(): UserData | null {
  const userJson = localStorage.getItem(USER_STORAGE_KEY)
  return userJson ? JSON.parse(userJson) : null
}

export function saveUser(user: UserData): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY)
}

