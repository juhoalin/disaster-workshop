"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UserRole,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleBadgeStyle,
    USER_ROLES,
} from "@/lib/user-roles";
import { useUser } from "@/lib/user-context";

export function ActiveUsersList() {
    const { user } = useUser();

    // Create active users based on all role types except "Other" and current user
    const activeUsers = USER_ROLES.filter(
        (role) => role !== "Other" && role !== user?.role
    ).map((role) => ({
        id: role,
        nickname: ROLE_DISPLAY_NAMES[role],
        role: role,
        avatar: `/profile-images/${role.toLowerCase()}.jpg`,
    }));

    // Utility function to get initials from nickname for the avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <Card className="w-full min-w-[280px] bg-gray-50">
            <CardHeader className="pb-2">
                <p className="text-xs text-gray-500 mb-1">Other active users</p>
            </CardHeader>
            <CardContent className="grid gap-3">
                {activeUsers.map((otherUser) => (
                    <div key={otherUser.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage
                                src={otherUser.avatar}
                                alt={otherUser.nickname}
                                className="object-cover"
                            />
                            <AvatarFallback>
                                {getInitials(otherUser.nickname)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5 min-w-0 flex-1">
                            <p className="text-sm font-medium leading-none break-words">
                                {otherUser.nickname}
                            </p>
                            <div
                                className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap",
                                    getRoleBadgeStyle(otherUser.role)
                                )}
                            >
                                {BADGE_DISPLAY_TEXT[otherUser.role]}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
