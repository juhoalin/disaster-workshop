import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { Suspense } from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Loading fallback for user provider
function UserProviderFallback() {
    return <div className="p-4 text-center">Loading user data...</div>;
}

export const metadata: Metadata = {
    title: "Disaster Social",
    description: "Make distasters great again",
    keywords: ["disaster", "crisis", "social media", "emergency information"],
    authors: [{ name: "G8" }],
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        title: "Disaster Social",
        description: "Make distasters great again",
        url: "https://disaster-social.vercel.app",
        siteName: "Disaster Social",
        locale: "en_US",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
                style={{ overscrollBehaviorX: "auto" }}
            >
                <Suspense fallback={<UserProviderFallback />}>
                    <UserProvider>{children}</UserProvider>
                </Suspense>
            </body>
        </html>
    );
}
