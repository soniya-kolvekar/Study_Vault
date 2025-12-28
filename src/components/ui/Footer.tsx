"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists() && snap.data().role === "admin") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    // Suppress "client offline" noise to user, just log it
                    console.warn("Footer role check failed (possibly offline):", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (!user) return null;

    return (
        <footer className="w-full py-6 mt-12 border-t border-white/10 bg-black/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} StudyVault. Sahyadri College of Engineering.</p>
                <div className="flex gap-6">
                    <Link href="/upload" className="hover:text-violet-400 transition-colors">
                        Contributors
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="hover:text-pink-400 transition-colors font-semibold">
                            Admin Dashboard
                        </Link>
                    )}
                </div>
            </div>
        </footer>
    );
}
