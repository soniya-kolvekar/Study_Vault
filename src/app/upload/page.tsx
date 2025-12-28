"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DEPARTMENTS, SEMESTERS } from "@/lib/constants"; // Assuming I expose constants
import { motion } from "framer-motion";
import { CloudUpload, FileImage, FileText, Loader2, X } from "lucide-react";
import { useState } from "react";

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [convertedPdf, setConvertedPdf] = useState<boolean>(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setConvertedPdf(false);
        }
    };

    const handleConvert = () => {
        if (files.length === 0) return;
        setLoading(true);
        // Simulate conversion
        setTimeout(() => {
            setLoading(false);
            setConvertedPdf(true);
        }, 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Resource uploaded for moderation!");
    };

    return (
        <div className="min-h-screen p-8 pt-24 flex justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl"
            >
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Contribute Resources</h1>
                        <p className="text-slate-400">Upload notes, question papers, or manuals.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Contributor Info</h3>
                                <input required type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500" />
                                <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500">
                                    <option value="" disabled selected>Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id} className="text-black">{d.name}</option>)}
                                </select>
                                <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500">
                                    <option value="" disabled selected>Select Semester</option>
                                    {SEMESTERS.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                                </select>
                            </div>

                            {/* Academic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Resource Details</h3>
                                <input required type="text" placeholder="Subject Name" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500" />
                                <input required type="text" placeholder="Module No/Name" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500" />
                                <input required type="text" placeholder="Faculty Name (Note Creator)" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500" />
                                <input type="number" placeholder="Syllabus Year (e.g. 2022)" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500" />
                            </div>
                        </div>

                        {/* File Upload / Converter */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-lg font-semibold text-white">Upload Files (Images to PDF)</h3>

                            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-colors hover:border-violet-500/50 hover:bg-violet-500/5 relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 text-slate-400 pointer-events-none">
                                    <CloudUpload className="w-10 h-10 text-violet-400" />
                                    <span className="font-medium text-white">Click to browse or drag files here</span>
                                    <span className="text-sm">Supports Images (PNG, JPG) and PDF</span>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span>{files.length} file(s) selected</span>
                                        <button type="button" onClick={() => setFiles([])} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                                    </div>

                                    {!convertedPdf ? (
                                        <button
                                            type="button"
                                            onClick={handleConvert}
                                            disabled={loading}
                                            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
                                            {loading ? "Converting..." : "Convert Images to PDF"}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-3 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                            <span className="font-medium">Ready for upload as PDF!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-all transform hover:scale-[1.01]"
                        >
                            Submit Resource
                        </button>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
