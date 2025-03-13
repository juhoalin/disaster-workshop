"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleCardBackground,
    getRoleBadgeStyle,
} from "@/lib/user-roles";

export function JoinForm() {
    const [nickname, setNickname] = useState("");
    const { user, login } = useUser();

    // Initialize nickname from user data if available
    useEffect(() => {
        if (user?.nickname) {
            setNickname(user.nickname);
        }
    }, [user]);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim() && user) {
            // Only update the nickname, preserve the role from user context
            login({ nickname: nickname.trim(), role: user.role });
        }
    };

    // Helper function to get user initials for the avatar
    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    if (user) {
        // Get the background color class for the user's role
        const roleBackground = getRoleCardBackground(user.role);
        const roleBadge = getRoleBadgeStyle(user.role);
        const displayName = ROLE_DISPLAY_NAMES[user.role as UserRole];
        const badgeText =
            BADGE_DISPLAY_TEXT[user.role as UserRole] || user.role;

        return (
            <div
                className={cn(
                    "flex items-center mb-6 p-4 rounded-lg border shadow",
                    roleBackground
                )}
            >
                <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                        {getInitials(user.nickname)}
                    </AvatarFallback>
                </Avatar>
                <div className="text-sm flex-1">
                    <p className="font-bold">{displayName}</p>
                    <p className="text-xs">
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full",
                                roleBadge
                            )}
                        >
                            {badgeText}
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Join the conversation</CardTitle>
                <CardDescription>
                    Enter your nickname to start posting
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleJoin} className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="submit"
                            disabled={!nickname.trim()}
                            className="flex-1"
                        >
                            Join
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
