import type { PostType, UserData } from "./types";

const POSTS_STORAGE_KEY = "x_feed_posts";
const USER_STORAGE_KEY = "x_feed_user";

// Helper to check if localStorage is available
const isLocalStorageAvailable = () => {
    // Only access localStorage in browser environment to prevent hydration mismatches
    if (typeof window === "undefined") return false;

    try {
        // Use a more reliable check that doesn't cause hydration mismatches
        window.localStorage.setItem("__storage_test__", "");
        window.localStorage.removeItem("__storage_test__");
        return true;
    } catch {
        return false;
    }
};

export function getPosts(): PostType[] {
    if (!isLocalStorageAvailable()) return [];
    const postsJson = localStorage.getItem(POSTS_STORAGE_KEY);
    return postsJson ? JSON.parse(postsJson) : [];
}

export function savePosts(posts: PostType[]): void {
    if (!isLocalStorageAvailable()) return;
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function getUser(): UserData | null {
    if (!isLocalStorageAvailable()) return null;
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

export function saveUser(user: UserData): void {
    if (!isLocalStorageAvailable()) return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
    if (!isLocalStorageAvailable()) return;
    localStorage.removeItem(USER_STORAGE_KEY);
}
