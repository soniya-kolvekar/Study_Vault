"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { SUBJECTS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { Book, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function SubjectPage() {
    const params = useParams();
    const router = useRouter();
    const dept = params?.dept as string;
    const sem = params?.sem as string;

    // Dynamic Subjects State
    const [subjects, setSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!dept || !sem) return;

        // Fetch subjects from Firestore (dynamic)
        const q = query(
            collection(db, "resources"),
            where("department", "==", dept),
            where("semester", "==", Number(sem)),
            where("status", "==", "approved")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dynamicSubjects = new Set<string>();
            snapshot.forEach(doc => {
                if (doc.data().subject) dynamicSubjects.add(doc.data().subject);
            });

            // Merge with default static subjects
            const defaultSubjects = SUBJECTS[`${dept}-${sem}`] || [];
            const merged = Array.from(new Set([...defaultSubjects, ...Array.from(dynamicSubjects)]));

            setSubjects(merged.sort());
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dept, sem]);

    return (
        <div className="min-h-screen p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <Link
                    href={`/dashboard/${dept}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 w-fit"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Semesters
                </Link>

                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Select Subject</h1>
                    <p className="text-slate-400">Department: {dept.toUpperCase()} | Semester: {sem}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub, idx) => (
                        <Link key={idx} href={`/dashboard/${dept}/${sem}/${encodeURIComponent(sub)}`}>
                            <GlassCard className="h-32 flex flex-row items-center gap-6 group hover:border-cyan-500/50 px-8">
                                <div className="p-3 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                                    <Book className="w-6 h-6 text-cyan-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors">{sub}</h3>
                            </GlassCard>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
