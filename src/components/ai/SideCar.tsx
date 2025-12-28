"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { useState } from "react";

export function SideCar() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Hi! I'm your StudyVault assistant. Ask me anything about your syllabus or notes!" }
    ]);
    const [input, setInput] = useState("");

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: `I found some resources related to "${input}" in Module 3.` }]);
        }, 1000);
        setInput("");
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleOpen}
                className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg hover:shadow-violet-500/50 transition-shadow"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </motion.button>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        className="fixed top-0 right-0 h-full w-80 z-40 p-4 pt-24"
                    >
                        <GlassCard className="h-full flex flex-col pointer-events-auto shadow-2xl bg-black/80 backdrop-blur-xl border-l border-white/10">
                            <div className="flex items-center gap-2 pb-4 border-b border-white/10 mb-4">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <h3 className="font-bold text-white">StudyVault AI</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                                ? 'bg-violet-600 text-white rounded-br-none'
                                                : 'bg-white/10 text-slate-200 rounded-bl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 mt-2 border-t border-white/10 flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask something..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                                />
                                <button
                                    onClick={handleSend}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-violet-600 text-white transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
