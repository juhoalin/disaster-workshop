// Define the available user roles
export type UserRole =
    | "Journalist"
    | "Government"
    | "Troll"
    | "Health"
    | "Student"
    | "Influencer"
    | "DEEV"
    | "Conspiracy"
    | "Other";

// Array of all possible roles for easy iteration
export const USER_ROLES: UserRole[] = [
    "Journalist",
    "Government",
    "Troll",
    "Health",
    "Student",
    "Influencer",
    "DEEV",
    "Conspiracy",
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
    Journalist: "Kalle Keskiaukeama",
    Government: "Anna Halin",
    Troll: "Juuso Halpa-Halko",
    Health: "Vika Salminen",
    Student: "Kreetta Ukkosmyrsky",
    Influencer: "Sara Kalikka",
    DEEV: "Outi Alapajula os. Miettinen",
    Conspiracy: "Anu Turta",
    Other: "User",
};

// Badge display text (what appears in the role badge)
export const BADGE_DISPLAY_TEXT: Record<UserRole, string> = {
    Journalist: "Yle Journalist",
    Government: "Prime Minister",
    Troll: "Political Troll",
    Health: "THL Official",
    Student: "Aalto Student",
    Influencer: "Lifestyle Influencer",
    DEEV: "Citizen (DEEV)",
    Conspiracy: "Truth Seeker",
    Other: "Citizen",
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    Journalist: "Professional reporter or media personnel",
    Government:
        "Government representative or official, in this case the Prime Minister",
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
        cardBackground: "role-bg-journalist",
        badge: "role-badge-journalist",
        description:
            "Journalists report on events and share reliable information",
    },
    Government: {
        cardBackground: "role-bg-government",
        badge: "role-badge-government",
        description: "Government officials provide authoritative information",
    },
    Troll: {
        cardBackground: "role-bg-troll",
        badge: "role-badge-troll",
        description: "Trolls spread chaos and misinformation",
    },
    Health: {
        cardBackground: "role-bg-health",
        badge: "role-badge-health",
        description: "Health professionals provide medical information",
    },
    Student: {
        cardBackground: "role-bg-student",
        badge: "role-badge-student",
        description: "Students are learning and sharing knowledge",
    },
    Influencer: {
        cardBackground: "role-bg-influencer",
        badge: "role-badge-influencer",
        description:
            "Influencers share their personal experiences and knowledge",
    },
    DEEV: {
        cardBackground: "role-bg-deev",
        badge: "role-badge-deev",
        description: "DEEV are the good guys",
    },
    Conspiracy: {
        cardBackground: "role-bg-conspiracy",
        badge: "role-badge-conspiracy",
        description: "Conspiracy Theorist",
    },
    Other: {
        cardBackground: "role-bg-other",
        badge: "role-badge-other",
        description: "Other",
    },
};

// Utility function to get card background style for a role
export function getRoleCardBackground(role: UserRole | string): string {
    // Ensure the role is valid
    if (!role || !isValidRole(role)) {
        console.warn(`Invalid role provided to getRoleCardBackground: ${role}`);
        return ROLE_STYLES["Other"].cardBackground;
    }
    return (
        ROLE_STYLES[role]?.cardBackground || ROLE_STYLES["Other"].cardBackground
    );
}

// Utility function to get badge style for a role
export function getRoleBadgeStyle(role: UserRole | string): string {
    // Ensure the role is valid
    if (!role || !isValidRole(role)) {
        console.warn(`Invalid role provided to getRoleBadgeStyle: ${role}`);
        return ROLE_STYLES["Other"].badge;
    }
    return ROLE_STYLES[role]?.badge || ROLE_STYLES["Other"].badge;
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
