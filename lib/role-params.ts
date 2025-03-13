import { UserRole, DEFAULT_ROLE } from "./user-roles";

// Define the mapping between URL parameters and user roles
export interface RoleParamConfig {
    // The query parameter value
    param: string;
    // The corresponding user role
    role: UserRole;
    // Default nickname for this role (optional)
    defaultNickname?: string;
}

// Define role parameter configurations
export const ROLE_PARAMS: RoleParamConfig[] = [
    {
        param: "journalist",
        role: "Journalist",
        defaultNickname: "Jussi Journalist",
    },
    {
        param: "government",
        role: "Government",
        defaultNickname: "Prime Minister",
    },
    {
        param: "troll",
        role: "Troll",
        defaultNickname: "Internet Troll",
    },
    {
        param: "health",
        role: "Health",
        defaultNickname: "THL Official",
    },
    {
        param: "student",
        role: "Student",
        defaultNickname: "Aalto Student",
    },
    {
        param: "influencer",
        role: "Influencer",
        defaultNickname: "Social Influencer",
    },
    {
        param: "deev",
        role: "DEEV",
        defaultNickname: "DEEV Member",
    },
    {
        param: "conspiracy",
        role: "Conspiracy",
        defaultNickname: "Truth Seeker",
    },
    // Default fallback
    {
        param: "other",
        role: "Other",
        defaultNickname: "Anonymous User",
    },
];

// The default role parameter (used if no query parameter is provided)
export const DEFAULT_ROLE_PARAM = "other";

/**
 * Get user role and default nickname based on URL query parameter
 * @param paramValue The URL query parameter value
 * @returns Object containing the role and default nickname
 */
export function getRoleFromParam(paramValue: string | null): {
    role: UserRole;
    defaultNickname: string;
} {
    if (!paramValue) {
        // If no parameter is provided, use the default role
        const defaultConfig = ROLE_PARAMS.find(
            (config) => config.param === DEFAULT_ROLE_PARAM
        );
        return {
            role: defaultConfig?.role || DEFAULT_ROLE,
            defaultNickname: defaultConfig?.defaultNickname || "Anonymous User",
        };
    }

    // Normalize the parameter (lowercase, trim)
    const normalizedParam = paramValue.toLowerCase().trim();

    // Find the matching role configuration
    const roleConfig = ROLE_PARAMS.find(
        (config) => config.param === normalizedParam
    );

    if (roleConfig) {
        return {
            role: roleConfig.role,
            defaultNickname: roleConfig.defaultNickname || "Anonymous User",
        };
    }

    // If no match is found, use the default role
    const defaultConfig = ROLE_PARAMS.find(
        (config) => config.param === DEFAULT_ROLE_PARAM
    );
    return {
        role: defaultConfig?.role || DEFAULT_ROLE,
        defaultNickname: defaultConfig?.defaultNickname || "Anonymous User",
    };
}
