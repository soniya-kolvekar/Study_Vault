"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DEPARTMENTS } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, FileText, Loader2, Save, Star, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [usn, setUsn] = useState("");
    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");

    // Resources State
    const [savedResources, setSavedResources] = useState<any[]>([]);
    const [contributions, setContributions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'saved' | 'contributions'>('saved');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/");
                return;
            }
            setUser(currentUser);

            try {
                // 1. Fetch Profile
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                let savedIds: string[] = [];

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || currentUser.displayName || "");
                    setUsn(data.usn || "");
                    setDepartment(data.department || "");
                    setSemester(data.semester?.toString() || "");
                    savedIds = data.savedResources || [];
                } else {
                    setName(currentUser.displayName || "");
                }

                // 2. Fetch Saved Resources (Parallel Fetch)
                if (savedIds.length > 0) {
                    const savedPromises = savedIds.map(id => getDoc(doc(db, "resources", id)));
                    const savedSnaps = await Promise.all(savedPromises);
                    const savedParams = savedSnaps
                        .filter(s => s.exists())
                        .map(s => ({ id: s.id, ...s.data() }));
                    setSavedResources(savedParams);
                } else {
                    setSavedResources([]);
                }

                // 3. Fetch Contributions
                const q = query(
                    collection(db, "resources"),
                    where("contributorId", "==", currentUser.uid)
                );
                const querySnap = await getDocs(q);
                const contribs = querySnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setContributions(contribs);

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name,
                usn,
                department,
                semester: Number(semester),
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    // Motivational Message logic
    const contributionCount = contributions.length;
    let motivationMessage = "Start your journey by sharing your first note!";
    if (contributionCount >= 1) motivationMessage = "Great start! Keep sharing knowledge.";
    if (contributionCount >= 5) motivationMessage = "You're a star contributor! 🌟";
    if (contributionCount >= 10) motivationMessage = "Legendary! Your juniors thank you. 👑";

    return (
        <div className="min-h-screen p-8 pt-24 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>

                {/* Profile Card */}
                <GlassCard className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8 border-b border-white/10 pb-6 text-center md:text-left">
                        <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-2xl font-bold shrink-0">
                            {name ? name.charAt(0).toUpperCase() : <UserIcon />}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">My Profile</h1>
                            <p className="text-slate-400 break-all">{user?.email}</p>
                        </div>
                        <div className="md:text-right mt-4 md:mt-0 w-full md:w-auto bg-white/5 md:bg-transparent p-4 md:p-0 rounded-xl">
                            <p className="text-3xl font-bold text-violet-400">{contributionCount}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Contributions</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">USN</label>
                                <input
                                    required
                                    type="text"
                                    value={usn}
                                    onChange={(e) => setUsn(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500"
                                    placeholder="4SF..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Department</label>
                                <select
                                    required
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500 text-white"
                                >
                                    <option value="" disabled className="text-slate-500">Select Department</option>
                                    {DEPARTMENTS.map(d => (
                                        <option key={d.id} value={d.id} className="text-black">
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Semester</label>
                                <select
                                    required
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-violet-500 text-white"
                                >
                                    <option value="" disabled className="text-slate-500">Select Semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <option key={s} value={s} className="text-black">
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    </form>
                </GlassCard>

                {/* Dashboard Section */}
                <div className="space-y-4">
                    <div className="flex gap-4 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'saved' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Saved Resources</span>
                            {activeTab === 'saved' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('contributions')}
                            className={`pb-4 px-4 font-medium transition-colors relative ${activeTab === 'contributions' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span className="flex items-center gap-2"><Star className="w-4 h-4" /> My Contributions</span>
                            {activeTab === 'contributions' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTab === 'saved' ? (
                            savedResources.length === 0 ? (
                                <p className="text-slate-500 py-8 col-span-2 text-center">No saved resources yet.</p>
                            ) : (
                                savedResources.map(res => (
                                    <GlassCard key={res.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-white line-clamp-1">{res.title}</h4>
                                            <p className="text-xs text-slate-400">{res.subject} • {res.department?.toUpperCase()}</p>
                                        </div>
                                        <a href={res.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-violet-500/10 text-violet-400 rounded-lg hover:bg-violet-500 hover:text-white transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </a>
                                    </GlassCard>
                                ))
                            )
                        ) : (
                            contributions.length === 0 ? (
                                <div className="col-span-2 text-center py-8 space-y-2">
                                    <p className="text-slate-500">You haven't contributed yet.</p>
                                    <p className="text-violet-400 font-medium">{motivationMessage}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="col-span-2 bg-gradient-to-r from-violet-600/20 to-pink-600/20 p-4 rounded-xl border border-white/10 text-center mb-4">
                                        <p className="text-lg font-bold text-white">{motivationMessage}</p>
                                        <p className="text-sm text-slate-400">Total Uploads: {contributionCount}</p>
                                    </div>
                                    {contributions.map(res => (
                                        <GlassCard key={res.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                            <div>
                                                <h4 className="font-bold text-white line-clamp-1">{res.title}</h4>
                                                <p className="text-xs text-slate-400">Views: {res.views} • Likes: {res.likes}</p>
                                            </div>
                                            <div className={`px-2 py-1 text-xs rounded uppercase font-bold ${res.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                res.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {res.status || 'Pending'}
                                            </div>
                                        </GlassCard>
                                    ))}
                                </>
                            )
                        )}
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
