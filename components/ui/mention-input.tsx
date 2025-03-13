import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    UserRole,
    USER_ROLES,
    ROLE_DISPLAY_NAMES,
    BADGE_DISPLAY_TEXT,
    getRoleBadgeStyle,
} from "@/lib/user-roles";
import { useUser } from "@/lib/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentionUser {
    id: string;
    nickname: string;
    role: UserRole;
    avatar: string;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    isTextarea?: boolean;
    rows?: number;
    id?: string;
    maxLength?: number;
}

export function MentionInput({
    value,
    onChange,
    placeholder,
    className,
    disabled,
    isTextarea = false,
    rows = 3,
    id,
    maxLength,
}: MentionInputProps) {
    const { user } = useUser();
    const [mentioning, setMentioning] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionStart, setMentionStart] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get all available users for mentions (excluding current user and "Other" role)
    const availableUsers: MentionUser[] = USER_ROLES.filter(
        (role) => role !== "Other" && role !== user?.role
    ).map((role) => ({
        id: role,
        nickname: ROLE_DISPLAY_NAMES[role],
        role: role,
        avatar: `/profile-images/${role.toLowerCase()}.jpg`,
    }));

    // Filter users based on mention query
    const filteredUsers = availableUsers.filter((user) =>
        user.nickname.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    // Reset selected index when filtered users change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredUsers.length]);

    // Handle input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const newValue = e.target.value;
        onChange(newValue);

        // Get cursor position
        const curPos = e.target.selectionStart || 0;
        setCursorPosition(curPos);

        // Check if user is trying to mention someone
        if (curPos > 0 && newValue[curPos - 1] === "@" && !mentioning) {
            setMentioning(true);
            setMentionStart(curPos);
            setMentionQuery("");
        } else if (mentioning) {
            // If cursor moved away from mention area, cancel mentioning
            if (curPos <= mentionStart) {
                setMentioning(false);
            } else {
                // Extract mention query (text after '@')
                const query = newValue.substring(mentionStart, curPos);
                setMentionQuery(query);

                // If user types a space or enters some specific character, stop mentioning
                if (query.includes(" ") || query.includes("\n")) {
                    setMentioning(false);
                }
            }
        }
    };

    // Handle selecting a user from dropdown
    const handleSelectUser = (user: MentionUser) => {
        // Create the new value with the mention inserted
        const beforeMention = value.substring(0, mentionStart - 1); // Remove the '@'
        const afterMention = value.substring(
            mentionStart + mentionQuery.length
        );

        // Insert mention with a space after it
        const newValue = `${beforeMention}@${user.nickname} ${afterMention}`;

        onChange(newValue);
        setMentioning(false);

        // Focus back on input after selection
        if (inputRef.current) {
            inputRef.current.focus();

            // Set cursor position after the inserted mention and space
            const newPosition = mentionStart - 1 + user.nickname.length + 2; // +2 for @ and space
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.setSelectionRange(
                        newPosition,
                        newPosition
                    );
                }
            }, 0);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!mentioning || filteredUsers.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < filteredUsers.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                if (mentioning && filteredUsers.length > 0) {
                    e.preventDefault();
                    handleSelectUser(filteredUsers[selectedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setMentioning(false);
                break;
            default:
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setMentioning(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    // Scroll to selected item in dropdown
    useEffect(() => {
        if (dropdownRef.current && mentioning) {
            const selectedElement = dropdownRef.current.querySelector(
                `[data-index="${selectedIndex}"]`
            );
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedIndex, mentioning]);

    return (
        <div className="relative">
            {isTextarea ? (
                <Textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    rows={rows}
                    className={className}
                    disabled={disabled}
                    maxLength={maxLength}
                />
            ) : (
                <Input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={className}
                    disabled={disabled}
                    maxLength={maxLength}
                />
            )}

            {mentioning && filteredUsers.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg mt-1"
                >
                    <div className="p-1">
                        {filteredUsers.map((user, index) => (
                            <div
                                key={user.id}
                                data-index={index}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                    index === selectedIndex
                                        ? "bg-gray-100"
                                        : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleSelectUser(user)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={user.avatar}
                                        alt={user.nickname}
                                        className="object-cover"
                                    />
                                    <AvatarFallback>
                                        {getInitials(user.nickname)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                    {user.nickname}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Component to render content with mentions highlighted
export function RenderContentWithMentions({ content }: { content: string }) {
    // Get valid user display names for mentions, excluding "Other" role
    const validMentionNames = USER_ROLES.filter((role) => role !== "Other").map(
        (role) => ROLE_DISPLAY_NAMES[role]
    );

    // Use a different approach to avoid text duplication
    // Create a regex to match all occurrences of @DisplayName
    const mentionPattern = new RegExp(
        `@(${validMentionNames.join("|")})\\b`,
        "g"
    );

    // Keep track of the last index we've processed
    let lastIndex = 0;
    // Store all the parts we'll render
    const parts: React.ReactNode[] = [];
    // Track which part we're on for keys
    let partIndex = 0;

    // Find all matches
    let match;
    while ((match = mentionPattern.exec(content)) !== null) {
        // Add any text before this match
        if (match.index > lastIndex) {
            parts.push(
                <span key={partIndex++}>
                    {content.substring(lastIndex, match.index)}
                </span>
            );
        }

        // Add the mention with styling
        parts.push(
            <span key={partIndex++} className="text-blue-500 font-medium">
                {match[0]}
            </span>
        );

        // Update the last index to after this match
        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last match
    if (lastIndex < content.length) {
        parts.push(
            <span key={partIndex++}>{content.substring(lastIndex)}</span>
        );
    }

    return <>{parts}</>;
}
