import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Disaster Social",
    description: "Share and discuss information during crisis events",
    keywords: ["disaster", "crisis", "social media", "emergency information"],
    authors: [{ name: "Disaster Social Team" }],
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        title: "Disaster Social",
        description: "Connect and share critical information during disasters",
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
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <UserProvider>{children}</UserProvider>
            </body>
        </html>
    );
}
