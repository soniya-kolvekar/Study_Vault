import { cn } from "@/lib/utils";
import { type HTMLMotionProps, motion } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "glass-panel rounded-2xl p-6 transition-all duration-300",
                hoverEffect && "hover:bg-white/10 hover:shadow-lg hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
