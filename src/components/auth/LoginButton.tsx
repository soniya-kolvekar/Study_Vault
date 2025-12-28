"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { motion } from "framer-motion";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginButton() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="glass-button group relative flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <LogIn className="h-5 w-5" />
            )}
            <span>{isLoading ? "Authenticating..." : "Login with Sahyadri Email"}</span>
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 opacity-20 blur-xl transition-opacity group-hover:opacity-40" />
        </motion.button>
    );
}
