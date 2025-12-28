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

export function ConfettiButton({ initialCount = 0, className }: ConfettiButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [liked, setLiked] = useState(false);

    const handleClick = () => {
        if (!liked) {
            setCount(prev => prev + 1);
            setLiked(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#ec4899', '#06b6d4']
            });
        } else {
            setCount(prev => prev - 1);
            setLiked(false);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all border",
                liked
                    ? "bg-pink-500/20 border-pink-500 text-pink-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10",
                className
            )}
        >
            <Heart className={cn("w-4 h-4", liked && "fill-current")} />
            <span>{count}</span>
        </motion.button>
    );
}
