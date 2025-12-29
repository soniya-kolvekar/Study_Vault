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
            <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row justify-between items-center text-sm text-slate-400 gap-4 md:gap-0">
                <p className="text-center md:text-left">&copy; {new Date().getFullYear()} StudyVault. Sahyadri College of Engineering.</p>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 w-full md:w-auto">
                    <Link href="/upload" className="hover:text-violet-400 transition-colors py-2 md:py-0">
                        Contributors
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="hover:text-pink-400 transition-colors font-semibold py-2 md:py-0">
                            Admin Dashboard
                        </Link>
                    )}
                </div>
            </div>
        </footer>
    );
}
