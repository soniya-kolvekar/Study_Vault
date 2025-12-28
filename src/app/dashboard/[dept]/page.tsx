"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { SEMESTERS } from "@/lib/constants";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SemesterPage() {
    const params = useParams();
    const dept = params?.dept as string;

    return (
        <div className="min-h-screen p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Select Semester</h1>
                    <p className="text-slate-400">Which semester are you in?</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {SEMESTERS.filter(sem => {
                        if (dept === 'fy') return [1, 2].includes(sem);
                        if (dept === 'mba') return [1, 2, 3, 4].includes(sem);
                        return [3, 4, 5, 6, 7, 8].includes(sem);
                    }).map((sem) => (
                        <Link key={sem} href={`/dashboard/${dept}/${sem}`}>
                            <GlassCard className="h-40 flex flex-col items-center justify-center gap-4 group hover:border-pink-500/50">
                                <div className="p-3 rounded-full bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
                                    <span className="text-2xl font-bold text-pink-300">{sem}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>Semester</span>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
