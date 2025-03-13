import type { PostType } from "./types";
import { UserRole, USER_ROLES } from "./user-roles";

export function generateDummyPosts(count: number): PostType[] {
    const posts: PostType[] = [];

    const authors = ["Alex", "Taylor", "Jordan", "Casey", "Riley", "Morgan"];
    const roles: UserRole[] = USER_ROLES;
    const contents = [
        "Just discovered an amazing new coffee shop downtown!",
        "Working on a new project. Can't wait to share it with everyone!",
        "What's everyone doing this weekend?",
        "Just finished reading an incredible book. Highly recommend!",
        "Beautiful day for a hike!",
        "Anyone else watching the new season of that popular show?",
        "Just adopted a puppy! My life is complete now.",
        "Thinking about learning a new programming language. Any suggestions?",
    ];

    for (let i = 0; i < count; i++) {
        const randomAuthor =
            authors[Math.floor(Math.random() * authors.length)];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const randomContent =
            contents[Math.floor(Math.random() * contents.length)];

        // Create random timestamp within the last week
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 7));
        timestamp.setHours(
            timestamp.getHours() - Math.floor(Math.random() * 24)
        );

        // Random number of likes
        const likesCount = Math.floor(Math.random() * 10);
        const likes: string[] = [];
        for (let j = 0; j < likesCount; j++) {
            const randomLiker =
                authors[Math.floor(Math.random() * authors.length)];
            if (!likes.includes(randomLiker)) {
                likes.push(randomLiker);
            }
        }

        // Random comments
        const commentsCount = Math.floor(Math.random() * 3);
        const comments = [];
        for (let j = 0; j < commentsCount; j++) {
            const commentAuthor =
                authors[Math.floor(Math.random() * authors.length)];
            const commentRole = roles[Math.floor(Math.random() * roles.length)];
            const commentTimestamp = new Date(timestamp);
            commentTimestamp.setHours(
                commentTimestamp.getHours() + Math.floor(Math.random() * 12) + 1
            );

            comments.push({
                id: crypto.randomUUID(),
                author: commentAuthor,
                authorRole: commentRole,
                content: `This is a comment from ${commentAuthor}!`,
                timestamp: commentTimestamp,
            });
        }

        posts.push({
            id: crypto.randomUUID(),
            author: randomAuthor,
            authorRole: randomRole,
            content: randomContent,
            timestamp,
            likes,
            comments,
        });
    }

    // Sort by timestamp, newest first
    return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
