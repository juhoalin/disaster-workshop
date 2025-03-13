import { Feed } from "@/components/feed";
import { ActiveUsersList } from "@/components/active-users-list";

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6 pt-4">
                    {/* Left sidebar with sticky app title */}
                    <div className="lg:w-[12%] lg:sticky lg:top-0 h-fit">
                        <div className="py-2 mt-0.5">
                            <h1 className="text-3xl font-bold">
                                Disaster Social
                            </h1>
                        </div>
                    </div>

                    {/* Main feed content */}
                    <div className="lg:w-[63%]">
                        <Feed />
                    </div>

                    {/* Right sidebar with active users */}
                    <div className="lg:w-1/4 lg:sticky lg:top-0 h-fit">
                        <div className="mt-0.5">
                            <ActiveUsersList />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
