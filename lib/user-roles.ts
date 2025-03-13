// Define the available user roles
export type UserRole = "Journalist" | "Government" | "Troll" | "Health" | "Student" | "Influencer" | "DEEV" | "Conspiracy" | "Troll" | "Other" ;

// Array of all possible roles for easy iteration
export const USER_ROLES: UserRole[] = [
    "Journalist",
    "Government",
    "Troll",
    "Health",
    "Student",
    "Influencer",
    "DEEV",
    "Health",
    "Other",
];

// Default role when creating a new user
export const DEFAULT_ROLE: UserRole = "Other";

// Style configurations for each role
export interface RoleStyleConfig {
    // Card background
    cardBackground: string;
    // Badge/Pill style for displaying the role
    badge: string;
    // Description for the role (optional)
    description?: string;
}

// Role display names (can be different from the enum values)
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
    Journalist: "YLE Journalist",
    Government: "Prime Minister",
    Troll: "Troll",
    Health: "THL",
    Student: "Aalto Student",
    Influencer: "Influencer",
    DEEV: "DEEV",
    Conspiracy: "Conspiracy Theorist",
    Other: "Other",
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    Journalist: "Professional reporter or media personnel",    
    Government: "Government representative or official",
    Troll: "Chaos agent",
    Health: "THL",
    Student: "Student",
    Influencer: "Influencer",
    DEEV: "DEEV",
    Conspiracy: "Conspiracy Theorist",
    Other: "Other",
};

// Style configurations for each role
export const ROLE_STYLES: Record<UserRole, RoleStyleConfig> = {
    Journalist: {
        cardBackground: "bg-blue-50 dark:bg-blue-950/30",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        description:
            "Journalists report on events and share reliable information",
    },
    Government: {
        cardBackground: "bg-green-50 dark:bg-green-950/30",
        badge: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        description: "Government officials provide authoritative information",
    },
    Troll: {
        cardBackground: "bg-red-50 dark:bg-red-950/30",
        badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        description: "Trolls spread chaos and misinformation",
    },
    Health: {
        cardBackground: "bg-yellow-50 dark:bg-yellow-950/30",
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        description: "Health professionals provide medical information",
    },
    Student: {
        cardBackground: "bg-purple-50 dark:bg-purple-950/30",
        badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        description: "Students are learning and sharing knowledge",
    },
    Influencer: {
        cardBackground: "bg-pink-50 dark:bg-pink-950/30",
        badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        description: "Influencers share their personal experiences and knowledge",
    },
    DEEV: {
        cardBackground: "bg-orange-50 dark:bg-orange-950/30",
        badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        description: "DEEV are the good guys",
    },
    Conspiracy: {
        cardBackground: "bg-red-50 dark:bg-red-950/30",
        badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        description: "Conspiracy Theorist",
    },
    Other: {
        cardBackground: "bg-gray-50 dark:bg-gray-950/30",
        badge: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        description: "Other",
    },
};

// Utility function to get card background style for a role
export function getRoleCardBackground(role: UserRole): string {
    return ROLE_STYLES[role]?.cardBackground || "";
}

// Utility function to get badge style for a role
export function getRoleBadgeStyle(role: UserRole): string {
    return ROLE_STYLES[role]?.badge || "";
}

// Utility function to check if a string is a valid role
export function isValidRole(role: string): role is UserRole {
    return USER_ROLES.includes(role as UserRole);
}

// Utility function to get display name for a role
export function getRoleDisplayName(role: UserRole): string {
    return ROLE_DISPLAY_NAMES[role] || role;
}

// Utility function to get role description
export function getRoleDescription(role: UserRole): string {
    return ROLE_DESCRIPTIONS[role] || "";
}
