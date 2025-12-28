"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Check, X, FileText } from "lucide-react";
import { useState } from "react";

// Mock Pending Data
const MOCK_PENDING = [
    { id: "p1", title: "ADE Notes Module 1", contributor: "John Doe", dept: "CS", sem: 3 },
    { id: "p2", title: "Maths Formula Sheet", contributor: "Jane Smith", dept: "IS", sem: 3 },
    { id: "p3", title: "OS Lab Manual", contributor: "Mike Ross", dept: "CS", sem: 4 },
];

export default function AdminPage() {
    const [pending, setPending] = useState(MOCK_PENDING);

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        // In real app, call API
        setPending(prev => prev.filter(p => p.id !== id));
        console.log(`Resource ${id} ${action}ed`);
    };

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-400">Moderate pending resource uploads.</p>
                </div>

                <div className="grid gap-4">
                    {pending.length === 0 ? (
                        <div className="text-center text-slate-500 py-12">No pending resources.</div>
                    ) : (
                        pending.map((item) => (
                            <GlassCard key={item.id} className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        <p className="text-sm text-slate-400">
                                            By {item.contributor} • {item.dept} - Sem {item.sem}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction(item.id, 'reject')}
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(item.id, 'approve')}
                                        className="p-2 rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            </GlassCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
