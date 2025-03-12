export type UserRole = "Journalist" | "Citizen" | "Government" | "Troll";

export interface UserData {
    nickname: string;
    role: UserRole;
}

export interface PostType {
    id: string;
    author: string;
    authorRole: UserRole;
    content: string;
    timestamp: Date;
    likes: string[];
    comments: {
        id: string;
        author: string;
        authorRole: UserRole;
        content: string;
        timestamp: Date;
    }[];
}
