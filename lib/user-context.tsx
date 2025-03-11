"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import type { UserData } from "./types";
import { getUser, saveUser, clearUser } from "./store";

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    login: (userData: UserData) => void;
    logout: () => void;
    cancelUserChange: () => void;
    isChangingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isChangingUser, setIsChangingUser] = useState(false);
    const [previousUser, setPreviousUser] = useState<UserData | null>(null);

    // Load user from local storage on mount
    useEffect(() => {
        setUser(getUser());
    }, []);

    const login = (userData: UserData) => {
        saveUser(userData);
        setUser(userData);
        setPreviousUser(null);
        setIsChangingUser(false);
    };

    const logout = () => {
        // Save current user before logging out to allow for cancel
        setPreviousUser(user);
        setIsChangingUser(true);
        clearUser();
        setUser(null);
    };

    const cancelUserChange = () => {
        if (previousUser) {
            // Restore previous user
            saveUser(previousUser);
            setUser(previousUser);
        }
        setIsChangingUser(false);
        setPreviousUser(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                cancelUserChange,
                isChangingUser,
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
