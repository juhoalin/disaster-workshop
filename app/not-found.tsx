"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Fallback component to show while the client components are loading
function LoadingFallback() {
    return <div className="p-8 text-center">Loading...</div>;
}

// Client component wrapper with Suspense
function NotFoundContent() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <Link href="/">
                <Button>Return Home</Button>
            </Link>
        </div>
    );
}

export default function NotFound() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NotFoundContent />
        </Suspense>
    );
}
