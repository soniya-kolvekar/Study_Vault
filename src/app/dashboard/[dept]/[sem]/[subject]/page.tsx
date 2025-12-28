"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ConfettiButton } from "@/components/ui/ConfettiButton";
import { auth, db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDoc, increment, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { ChevronLeft, Eye, FileText, Search, User, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Resource {
    id: string;
    title: string;
    contributorName: string;
    faculty: string;
    views: number;
    likes: number;
    fileUrl: string;
    subject: string;
    createdAt: any;
}

export default function ResourcePage() {
    const params = useParams();
    const router = useRouter();
    const dept = params?.dept as string;
    const sem = Number(params?.sem);
    const subject = decodeURIComponent(params?.subject as string);

    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<Resource[]>([]);
    const [search, setSearch] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    // Auth & Admin Check
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists() && userSnap.data().role === "admin") {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error("Admin check error:", error);
                }
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!dept || !sem || !subject) return;

        // Query: Dept + Sem + Subject + Approved
        const q = query(
            collection(db, "resources"),
            where("department", "==", dept),
            where("semester", "==", sem),
            where("subject", "==", subject),
            where("status", "==", "approved")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Resource[];
            setResources(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching resources:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dept, sem, subject]);

    const handleView = async (resource: Resource) => {
        // Open File in the same tab to avoid "new tab" behavior
        window.open(resource.fileUrl, "_self");

        // Increment View Count in background
        try {
            const ref = doc(db, "resources", resource.id);
            await updateDoc(ref, {
                views: increment(1)
            });
        } catch (err) {
            console.error("Failed to increment view", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            await deleteDoc(doc(db, "resources", id));
            alert("Resource deleted.");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete.");
        }
    };

    const filteredResources = resources.filter(res =>
        res.title.toLowerCase().includes(search.toLowerCase()) ||
        res.faculty?.toLowerCase().includes(search.toLowerCase()) ||
        res.contributorName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
            >
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Subjects
                    </button>
                    {isAdmin && <span className="text-red-400 text-xs font-mono border border-red-500/20 px-2 py-1 rounded">Admin Mode</span>}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white max-w-2xl">{subject}</h1>
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

                {filteredResources.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-xl">No resources found for this subject yet.</p>
                        <p className="text-sm mt-2">Be the first to contribute!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {filteredResources.map((res) => (
                            <GlassCard key={res.id} className="flex flex-col gap-4 group relative">
                                {isAdmin && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(res.id); }}
                                        className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors z-10"
                                        title="Delete Resource (Admin)"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="flex items-start justify-between pr-8">
                                    <div className="p-3 bg-violet-500/20 rounded-lg group-hover:bg-violet-500/30 transition-colors">
                                        <FileText className="w-6 h-6 text-violet-300" />
                                    </div>
                                    <div className="px-2 py-1 bg-white/5 rounded text-xs text-slate-400 font-mono">
                                        PDF
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight min-h-[3rem]">{res.title}</h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-2">
                                        <User className="w-3 h-3" /> {res.contributorName}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Prof. {res.faculty}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {res.views || 0}</span>
                                        <ConfettiButton initialCount={res.likes || 0} className="text-sm px-3 py-1" />
                                    </div>
                                    <button
                                        onClick={() => handleView(res)}
                                        className="text-violet-400 hover:text-white font-medium hover:underline cursor-pointer"
                                    >
                                        View File
                                    </button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
