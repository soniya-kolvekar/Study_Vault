"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiButtonProps {
    initialCount?: number;
    className?: string;
}

export function ConfettiButton({ initialCount = 0, isLiked = false, onToggle, className }: { initialCount?: number, isLiked?: boolean, onToggle?: () => Promise<void>, className?: string }) {
    const [count, setCount] = useState(initialCount);
    // synchronize local count when initialCount changes (e.g. from real-time updates)
    // but only if we are not currently optimistically updating? 
    // actually, let's keep it simple: rely on parent for "isLiked" source of truth, 
    // but manage count optimistically for instant feedback.

    // However, if we want strict control, we should trust the parent. 
    // Let's implement an optimistic pattern here.

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!onToggle) return;

        // Optimistic Update
        const newLikedState = !isLiked;
        setCount(prev => newLikedState ? prev + 1 : prev - 1);

        if (newLikedState) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#ec4899', '#06b6d4']
            });
        }

        try {
            await onToggle();
        } catch (error) {
            // Revert on failure
            setCount(prev => newLikedState ? prev - 1 : prev + 1);
            console.error("Failed to toggle like");
        }
    };

    // Update local count if initialCount changes from DB (avoids desync)
    // checking if count is wildly different to avoid overwriting optimistic updates
    if (initialCount !== count && Math.abs(initialCount - count) > 1) {
        setCount(initialCount);
    }

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
                isLiked
                    ? "bg-pink-500/20 border-pink-500 text-pink-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
                className
            )}
        >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
            <span>{count}</span>
        </motion.button>
    );
}
