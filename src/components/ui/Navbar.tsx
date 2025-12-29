"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                // Let the page handle redirect if needed (dashboard protects itself)
                return;
            }
            setUser(currentUser);

            // Check Profile
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    // Force Redirect to Profile if not there already
                    if (!pathname?.startsWith("/profile")) {
                        // Strict enforcement with alert
                        alert("Your profile is incomplete. You must complete your profile to continue.");
                        router.push("/profile");
                    }
                }
            } catch (err) {
                console.error("Profile check failed", err);
            }
        });
        return () => unsubscribe();
    }, [pathname, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (!user) return null; // Don't show navbar if not logged in (or let layout handle it)

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
            <Link href="/story" className="text-2xl font-bold tracking-tighter text-white">
                STUDY<span className="text-violet-500">VAULT</span>
            </Link>

            <div className="relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-200 hover:bg-violet-600/40 transition-colors"
                >
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
                </button>

                {menuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 border-b border-white/10">
                                <p className="text-sm font-bold text-white truncate">{profile?.name || "User"}</p>
                                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                            </div>
                            <Link
                                href="/profile"
                                onClick={() => setMenuOpen(false)}
                                className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                My Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
