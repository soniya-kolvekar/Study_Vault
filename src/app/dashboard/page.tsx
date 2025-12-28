"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DEPARTMENTS } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/useAuth"; // I need to create this hook
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Brain, Database, HardHat, Laptop, Radio, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

const iconMap: any = {
    Laptop,
    Database,
    Radio,
    Wrench,
    HardHat,
    Brain,
};

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/");
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Select Department</h1>
                    <p className="text-slate-400">Choose your engineering branch to proceed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEPARTMENTS.map((dept, index) => {
                        const Icon = iconMap[dept.icon] || Laptop;
                        return (
                            <Link key={dept.id} href={`/dashboard/${dept.id}`}>
                                <GlassCard className="h-48 flex flex-col items-center justify-center gap-4 group">
                                    <div className="p-4 rounded-full bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                                        <Icon className="w-8 h-8 text-violet-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">{dept.name}</h3>
                                </GlassCard>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
