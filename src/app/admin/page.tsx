"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { Check, ChevronLeft, Edit2, FileText, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define the Resource type matching Firestore
interface Resource {
    id: string;
    title: string;
    contributorName: string;
    department: string;
    semester: number;
    subject: string;
    module: string;
    status: string;
    fileUrl: string;
}

export default function AdminPage() {
    const [pending, setPending] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminDept, setAdminDept] = useState<string>(""); // 'all' or specific dept

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Resource>>({});

    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push("/");
                return;
            }

            try {
                // Check if user is admin
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists() && userSnap.data().role === "admin") {
                    setIsAdmin(true);
                    setAdminDept(userSnap.data().department || "all"); // Default to all if not set
                } else {
                    alert("Access Denied: You are not an admin.");
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Admin check failed:", error);
                alert("Connection Error: Could not verify admin privileges.");
                router.push("/dashboard");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [router]);

    useEffect(() => {
        if (!isAdmin) return;

        let q;
        if (adminDept === "all" || !adminDept) {
            q = query(collection(db, "resources"), where("status", "==", "pending"));
        } else {
            // Filter by department
            q = query(collection(db, "resources"), where("status", "==", "pending"), where("department", "==", adminDept));
        }

        const unsubscribeResources = onSnapshot(q, (snapshot) => {
            const resources = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Resource[];

            setPending(resources);
        }, (error) => {
            console.error("Realtime update failed:", error);
            // Ignore permission errors if they are just due to the query adjusting
        });

        return () => unsubscribeResources();
    }, [isAdmin, adminDept]);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            if (action === 'approve') {
                const resourceRef = doc(db, "resources", id);

                // If we are editing this one, use the new data!
                const updates = editingId === id ? { ...editData, status: "approved" } : { status: "approved" };

                // Update title if subject/module changed
                if (updates.subject || updates.module) {
                    updates.title = `${updates.subject || 'Unknown'} - ${updates.module || 'Unknown'}`;
                }

                await updateDoc(resourceRef, updates);
                setEditingId(null);
            } else {
                const resourceRef = doc(db, "resources", id);
                await deleteDoc(resourceRef);
            }
        } catch (error) {
            console.error(`Error ${action}ing resource:`, error);
            alert(`Failed to ${action} resource.`);
        }
    };

    const startEdit = (resource: Resource) => {
        setEditingId(resource.id);
        setEditData({
            subject: resource.subject,
            module: resource.module,
            semester: resource.semester,
            department: resource.department
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="max-w-5xl mx-auto space-y-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Moderate & Organize pending uploads.</p>
                    </div>
                    <div className="text-right text-sm text-slate-400">
                        Managing: <span className="text-violet-400 font-mono uppercase">{adminDept === 'all' ? 'All Departments' : adminDept}</span>
                    </div>
                </div>

                <div className="grid gap-4">
                    {pending.length === 0 ? (
                        <div className="text-center text-slate-500 py-12">No pending resources for your department.</div>
                    ) : (
                        pending.map((item) => (
                            <GlassCard key={item.id} className="p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                                <FileText className="w-6 h-6 text-yellow-300" />
                                            </div>
                                            <div>
                                                {editingId === item.id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                                            value={editData.subject}
                                                            onChange={e => setEditData({ ...editData, subject: e.target.value })}
                                                            placeholder="Subject"
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs w-20"
                                                                value={editData.module}
                                                                onChange={e => setEditData({ ...editData, module: e.target.value })}
                                                                placeholder="Module"
                                                            />
                                                            <input
                                                                type="number"
                                                                className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs w-16"
                                                                value={editData.semester}
                                                                onChange={e => setEditData({ ...editData, semester: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className="font-bold text-white">{item.title}</h3>
                                                        <p className="text-sm text-slate-400">
                                                            By {item.contributorName} • {item.department} - Sem {item.semester}
                                                        </p>
                                                    </>
                                                )}
                                                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline mt-1 block">
                                                    View File
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            {editingId === item.id ? (
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 rounded-lg hover:bg-slate-500/20 text-slate-400 transition-colors"
                                                    title="Cancel Edit"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => handleAction(item.id, 'reject')}
                                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.id, 'approve')}
                                            className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            {editingId === item.id ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            {editingId === item.id ? "Save & Approve" : "Approve"}
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
