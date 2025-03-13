import { Feed } from "@/components/feed";

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            <div className="container max-w-2xl mx-auto py-4 px-4 sm:py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Disaster Social</h1>
                </div>
                <Feed />
            </div>
        </main>
    );
}
