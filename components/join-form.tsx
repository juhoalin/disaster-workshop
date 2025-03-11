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
import type { UserRole } from "@/lib/types";
import { useUser } from "@/lib/user-context";

export function JoinForm() {
    const [nickname, setNickname] = useState("");
    const [role, setRole] = useState<UserRole>("User");
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
        setRole("User");
    };

    const handleCancel = () => {
        cancelUserChange();
    };

    if (user && !isChangingUser) {
        return (
            <div className="flex items-center justify-between mb-6 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                    <p>
                        Posting as{" "}
                        <span className="font-bold">{user.nickname}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Role: {user.role}
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
                                <SelectItem value="Journalist">
                                    Journalist
                                </SelectItem>
                                <SelectItem value="Citizen">Citizen</SelectItem>
                                <SelectItem value="Government">
                                    Government
                                </SelectItem>
                                <SelectItem value="Troll">Troll</SelectItem>
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
