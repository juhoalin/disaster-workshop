"use client";

import { Feed } from "@/components/feed";
import { ActiveUsersList } from "@/components/active-users-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
    const scrollToCreatePost = () => {
        const createPostElement = document.getElementById("create-post-input");
        if (createPostElement) {
            createPostElement.scrollIntoView({ behavior: "smooth" });
            createPostElement.focus();
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 pt-4">
                    {/* Left sidebar with sticky app title */}
                    <div className="lg:w-[18%] lg:sticky lg:top-2 h-fit">
                        <div className="py-2 mt-0.5">
                            <h1 className="text-3xl font-bold">
                                DISASTER SOCIAL
                            </h1>
                            <Button
                                className="mt-4 bg-black hover:bg-gray-800 w-full"
                                onClick={scrollToCreatePost}
                            >
                                Create
                                <Plus className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Main feed content */}
                    <div className="lg:w-[57%]">
                        <Feed createInputId="create-post-input" />
                    </div>

                    {/* Right sidebar with active users */}
                    <div className="lg:w-1/4 lg:sticky lg:top-3 h-fit">
                        <div className="mt-0.5">
                            <ActiveUsersList />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
