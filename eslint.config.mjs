import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": "error",
            // Suppress hydration warnings in development
            "react/no-unescaped-entities": "off",
            // Suppress the React hydration mismatch warnings
            "react-hooks/exhaustive-deps": "warn",
            // This setting can help specifically with hydration warnings
            "@next/next/no-html-link-for-pages": "off",
        },
    },
];

export default eslintConfig;
