"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ConfettiButton } from "@/components/ui/ConfettiButton";
import { motion } from "framer-motion";
import { ChevronLeft, FileText, Search, User, Eye, Heart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// Mock Data
const MOCK_RESOURCES = [
    { id: "1", title: "Module 1 Notes", contributor: "Varun", faculty: "Prof. Smith", views: 120, likes: 45, type: "pdf" },
    { id: "2", title: "Question Bank 2024", contributor: "Rahul", faculty: "Prof. Jane", views: 85, likes: 20, type: "pdf" },
    { id: "3", title: "Lab Manual", contributor: "Priya", faculty: "Prof. Alan", views: 200, likes: 80, type: "pdf" },
];

export default function ResourcePage() {
    const params = useParams();
    const router = useRouter();
    const subject = decodeURIComponent(params?.subject as string);
    const [search, setSearch] = useState("");

    const filteredResources = MOCK_RESOURCES.filter(res =>
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.faculty.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Subjects
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{subject}</h1>
                        <p className="text-slate-400">Available Resources</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-violet-500 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {filteredResources.map((res) => (
                        <GlassCard key={res.id} className="flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-violet-500/20 rounded-lg">
                                    <FileText className="w-6 h-6 text-violet-300" />
                                </div>
                                <div className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 font-mono">
                                    PDF
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white line-clamp-1">{res.title}</h3>
                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                    <User className="w-3 h-3" /> {res.contributor} • {res.faculty}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {res.views}</span>
                                    <ConfettiButton initialCount={res.likes} className="text-sm px-3 py-1" />
                                </div>
                                <button className="text-violet-400 hover:text-violet-300 font-medium">View</button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
