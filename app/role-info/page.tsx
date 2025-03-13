"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ROLE_PARAMS } from "@/lib/role-params";

export default function RoleInfoPage() {
    // Initialize URL state
    const [currentUrl, setCurrentUrl] = useState<string>("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This only runs on the client
        setIsClient(true);
        setCurrentUrl(window.location.origin);
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto py-4 px-4 sm:py-6 sm:px-0">
                <h1 className="text-3xl font-bold mb-6">
                    Role URL Parameters Guide
                </h1>

                <div className="mb-8">
                    <p className="mb-4">
                        This application now uses URL parameters to determine
                        user roles. You can no longer change roles manually in
                        the interface.
                    </p>
                    <p className="mb-4">
                        To change roles, use the{" "}
                        <code className="bg-gray-200 px-1 rounded">
                            ?role=ROLE_PARAM
                        </code>{" "}
                        parameter in the URL.
                    </p>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">
                        Available Role Parameters
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        URL Parameter
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Default Nickname
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Link
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ROLE_PARAMS.map((roleParam) => (
                                    <tr key={roleParam.param}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="bg-gray-200 px-1 rounded">
                                                {roleParam.param}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {roleParam.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {roleParam.defaultNickname}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/?role=${roleParam.param}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Try it
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Examples</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <Link
                                href="/"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Default (Other role):{" "}
                                {isClient ? `${currentUrl}/` : ""}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/?role=journalist"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Journalist:{" "}
                                {isClient
                                    ? `${currentUrl}/?role=journalist`
                                    : ""}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/?role=government"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Government:{" "}
                                {isClient
                                    ? `${currentUrl}/?role=government`
                                    : ""}
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="mb-4">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        ← Back to main page
                    </Link>
                </div>
            </div>
        </main>
    );
}
