"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import {
    UserRole,
    DEFAULT_ROLE,
    USER_ROLES,
    ROLE_DISPLAY_NAMES,
    ROLE_DESCRIPTIONS,
    getRoleCardBackground,
    getRoleBadgeStyle,
} from "@/lib/user-roles";

export function JoinForm() {
    const [nickname, setNickname] = useState("");
    const [role, setRole] = useState<UserRole>(DEFAULT_ROLE);
    const { user, login, logout, cancelUserChange, isChangingUser } = useUser();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            login({ nickname: nickname.trim(), role });
        }
    };

    const handleLogout = () => {
        logout();
        // Reset form fields for new user
        setNickname("");
        setRole(DEFAULT_ROLE);
    };

    const handleCancel = () => {
        cancelUserChange();
    };

    if (user && !isChangingUser) {
        // Get the background color class for the user's role
        const roleBackground = getRoleCardBackground(user.role);
        const roleBadge = getRoleBadgeStyle(user.role);

        return (
            <div
                className={cn(
                    "flex items-center justify-between mb-6 p-4 rounded-lg border shadow",
                    roleBackground
                )}
            >
                <div className="text-sm">
                    <p>
                        Posting as{" "}
                        <span className="font-bold">{user.nickname}</span>
                    </p>
                    <p className="text-xs">
                        Role:{" "}
                        <span
                            className={cn(
                                "ml-1 px-1.5 py-0.5 rounded-full",
                                roleBadge
                            )}
                        >
                            {user.role}
                        </span>
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    Change User
                </Button>
            </div>
        );
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>
                    {isChangingUser ? "Change User" : "Join the conversation"}
                </CardTitle>
                <CardDescription>
                    Choose a nickname and role to start posting anonymously
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
                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">
                            Select your role
                        </label>
                        <Select
                            value={role}
                            onValueChange={(value) =>
                                setRole(value as UserRole)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {USER_ROLES.map((roleOption) => (
                                    <SelectItem
                                        key={roleOption}
                                        value={roleOption}
                                        title={ROLE_DESCRIPTIONS[roleOption]}
                                    >
                                        {ROLE_DISPLAY_NAMES[roleOption]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            type="submit"
                            disabled={!nickname.trim()}
                            className="flex-1"
                        >
                            {isChangingUser ? "Continue as New User" : "Join"}
                        </Button>
                        {isChangingUser && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
