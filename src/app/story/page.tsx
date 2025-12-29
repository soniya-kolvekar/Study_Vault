"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { ChevronLeft, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StoryPage() {
    const router = useRouter();

    const team = [
        { name: "Soniya", role: "Team Lead", initial: "S" },
        { name: "Tanish Poojari", role: "Member", initial: "T" },
        { name: "Saishree Shet", role: "Member", initial: "S" },
        { name: "Varun", role: "Member", initial: "V" },
    ];

    return (
        <div className="min-h-screen p-8 pt-24 text-white">
            <div className="max-w-5xl mx-auto space-y-12">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                {/* Vision Section */}
                <section className="text-center space-y-6">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">Our Vision</h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        To create a seamless academic ecosystem where knowledge flows freely.
                        StudyVault empowers students to share resources, collaborate, and succeed together.
                    </p>
                </section>

                {/* Team Section */}
                <section>
                    <div className="flex items-center gap-4 mb-8 justify-center">
                        <Users className="w-8 h-8 text-violet-400" />
                        <h2 className="text-3xl font-bold">Meet the Team</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map((member, idx) => (
                            <GlassCard key={idx} className="p-6 flex flex-col items-center text-center group hover:bg-white/5 transition-colors">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-xl">
                                    {member.initial}
                                </div>
                                <h3 className="text-xl font-bold">{member.name}</h3>
                                <p className="text-violet-300 text-sm">{member.role}</p>
                            </GlassCard>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
