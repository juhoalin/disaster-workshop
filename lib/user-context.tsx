"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import type { UserData } from "./types";
import { getUser, saveUser } from "./store";
import { getRoleFromParam } from "./role-params";

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    login: (userData: UserData) => void;
    // Remove logout functionality as per requirements
    // logout: () => void;
    // cancelUserChange: () => void;
    // isChangingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const searchParams = useSearchParams();

    // Load user from URL parameters or local storage on mount
    useEffect(() => {
        // Get the role parameter from URL
        const roleParam = searchParams.get("role");

        // Get user role and default nickname based on the parameter
        const { role, defaultNickname } = getRoleFromParam(roleParam);

        // Check if we already have a stored user
        const storedUser = getUser();

        if (storedUser) {
            // Update the stored user's role based on URL parameter
            const updatedUser = {
                ...storedUser,
                role: role, // Override the role with URL parameter
            };
            saveUser(updatedUser);
            setUser(updatedUser);
        } else {
            // Create a new user with default nickname and role from URL
            const newUser = {
                nickname: defaultNickname,
                role: role,
            };
            saveUser(newUser);
            setUser(newUser);
        }
    }, [searchParams]);

    const login = (userData: UserData) => {
        // Preserve the role from URL parameters
        const roleParam = searchParams.get("role");
        const { role } = getRoleFromParam(roleParam);

        // Create updated user data with the URL-based role
        const updatedUserData = {
            ...userData,
            role: role, // Ensure the role is always from the URL
        };

        saveUser(updatedUserData);
        setUser(updatedUserData);
    };

    // Remove the logout and cancelUserChange functions as we're disabling user changing

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                login,
                // Remove these properties as they're no longer needed
                // logout,
                // cancelUserChange,
                // isChangingUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
