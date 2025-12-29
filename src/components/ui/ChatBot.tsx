"use client";

import { auth, db } from "@/lib/firebase";
import { useChatStore } from "@/lib/store/chatStore";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, FileText, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export function ChatBot() {
    const { isOpen, toggleOpen, messages, addMessage, setMessages, isLoading, setLoading, currentResource } = useChatStore();
    const [input, setInput] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auth Change Listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => setUser(u));
        return () => unsub();
    }, []);

    // Firestore Sync (Load History)
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "users", user.uid, "chat_history"),
            orderBy("createdAt", "asc"),
            limit(50) // Load last 50 messages
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => ({
                role: doc.data().role,
                text: doc.data().text
            })) as any[];

            if (loadedMessages.length > 0) {
                setMessages(loadedMessages);
            }
        });

        return () => unsub();
    }, [user, setMessages]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user' as const, text };

        // Optimistic Update (or Local Only)
        if (!user) addMessage(userMsg);

        // Persistence
        if (user) {
            try {
                await addDoc(collection(db, "users", user.uid, "chat_history"), {
                    role: 'user',
                    text: text,
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Failed to save chat:", e);
                // Fallback to local if save fails
                addMessage(userMsg);
            }
        }

        setInput("");
        setLoading(true);

        try {
            // Prepare history for API
            const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: historyPayload,
                    contextFileUrl: currentResource?.url,
                    contextFileType: currentResource?.type,
                    resourceList: useChatStore.getState().resourceList
                })
            });

            const data = await res.json();
            const responseText = data.text || "Something went wrong.";

            // Save AI Response
            if (user) {
                await addDoc(collection(db, "users", user.uid, "chat_history"), {
                    role: 'model',
                    text: responseText,
                    createdAt: serverTimestamp()
                });
                // Note: onSnapshot will auto-update the UI/Store
            } else {
                addMessage({ role: 'model', text: responseText });
            }

        } catch (error) {
            console.error(error);
            const errMsg = "Failed to connect to AI.";
            if (user) {
                // Try to save error message if possible? Maybe not.
                // Just show local error
                addMessage({ role: 'model', text: errMsg });
            } else {
                addMessage({ role: 'model', text: errMsg });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Context Awareness Toast / Chip */}
            <AnimatePresence>
                {isOpen && currentResource && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed bottom-24 right-6 z-50 bg-violet-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2"
                    >
                        <FileText className="w-3 h-3" />
                        Analyzing: {currentResource.type === 'pdf' ? 'PDF Document' : 'Image Resource'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[60] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">StudyVault AI</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-yellow-400" />
                                        Gemini Pro
                                    </p>
                                </div>
                            </div>
                            <button onClick={toggleOpen} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-none'
                                        : 'bg-white/10 text-slate-100 rounded-bl-none'
                                        }`}>
                                        <ReactMarkdown
                                            components={{
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1 my-2" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-pink-300" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-cyan-400 hover:underline" target="_blank" {...props} />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 rounded-2xl p-3 rounded-bl-none flex items-center gap-2">
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions (Quick Actions) */}
                        {currentResource && !isLoading && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => handleSend("Summarize this document for me.")}
                                    className="text-xs bg-violet-500/20 hover:bg-violet-500/40 border border-violet-500/30 text-violet-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                                >
                                    📝 Summarize Notes
                                </button>
                                <button
                                    onClick={() => handleSend("Identify important repeated topics in this paper.")}
                                    className="text-xs bg-pink-500/20 hover:bg-pink-500/40 border border-pink-500/30 text-pink-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                                >
                                    🔥 Analyze Topics
                                </button>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={currentResource ? "Ask about this document..." : "Ask Gemini about StudyVault..."}
                                    autoFocus
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white focus:outline-none focus:border-violet-500 focus:bg-black/40 transition-all placeholder:text-slate-500"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                onClick={toggleOpen}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-500/30 flex items-center justify-center text-white border border-white/20 hover:shadow-violet-500/50 transition-all"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                )}
            </motion.button>
        </>
    );
}
