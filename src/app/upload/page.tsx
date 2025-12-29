"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { DEPARTMENTS, SEMESTERS, SUBJECTS } from "@/lib/constants";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { ChevronLeft, CloudUpload, FileImage, FileText, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

export default function UploadPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [convertedPdf, setConvertedPdf] = useState<boolean>(false);

    // Form States
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");
    const [semesterOptions, setSemesterOptions] = useState<number[]>([]);

    // Subject Logic
    const [subject, setSubject] = useState("");
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [subjectInputType, setSubjectInputType] = useState<'select' | 'text'>('text');

    const [moduleName, setModuleName] = useState("");
    const [faculty, setFaculty] = useState("");
    const [year, setYear] = useState("");

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Dynamic Semester Logic
    useEffect(() => {
        if (!department) {
            setSemesterOptions([]);
            return;
        }

        if (department === 'fy') {
            setSemesterOptions([1, 2]);
        } else if (department === 'mba') {
            setSemesterOptions([1, 2, 3, 4]);
        } else {
            // All other departments (CS, IS, EC, ME, etc.)
            setSemesterOptions([3, 4, 5, 6, 7, 8]);
        }

        // Reset semester if it's no longer valid in the new range
        setSemester("");
    }, [department]);

    // Update Available Subjects (Dynamic + Static) when Dept/Sem changes
    useEffect(() => {
        if (department && semester) {
            setLoading(true);

            // 1. Get Static Defaults
            const key = `${department}-${semester}`;
            const staticSubjects = SUBJECTS[key] || [];

            // 2. Fetch Dynamic Subjects from Firestore
            const q = query(
                collection(db, "resources"),
                where("department", "==", department),
                where("semester", "==", Number(semester)),
                where("status", "==", "approved")
            );

            // We use onSnapshot to get real-time updates
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const dynamicSet = new Set<string>();
                snapshot.forEach(doc => {
                    const sub = doc.data().subject;
                    if (sub) dynamicSet.add(sub);
                });

                // Merge static and dynamic
                const merged = Array.from(new Set([...staticSubjects, ...Array.from(dynamicSet)])).sort();

                setAvailableSubjects(merged);

                if (merged.length > 0) {
                    setSubjectInputType('select');
                    setSubject("");
                } else {
                    setSubjectInputType('text');
                    setSubject("");
                }
                setLoading(false);
            });

            return () => unsubscribe();
        } else {
            setAvailableSubjects([]);
            setLoading(false);
        }
    }, [department, semester]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setConvertedPdf(false);
        }
    };

    // Helper to compress image
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject("Canvas context failed");

                    // Resize logic (Max 2000px)
                    const MAX_SIZE = 2000;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 60% quality
                    resolve(canvas.toDataURL("image/jpeg", 0.6));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setLoading(true);

        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF();

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith("image/")) continue;

                // Compress image before adding to PDF
                const imageData = await compressImage(file);
                const imgProps = doc.getImageProperties(imageData);

                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                if (i > 0) doc.addPage();
                doc.addImage(imageData, "JPEG", 0, 0, pdfWidth, pdfHeight);
            }

            // Generate ArrayBuffer -> Blob -> File (Cleanest Binary Method)
            const pdfArrayBuffer = doc.output("arraybuffer");
            const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

            // Ensure filename ends in .pdf
            const finalFilename = `${subject || "document"}.pdf`;
            const pdfFile = new File([pdfBlob], finalFilename, { type: "application/pdf" });

            setFiles([pdfFile]);
            setConvertedPdf(true);
        } catch (error) {
            console.error(error);
            alert("Error converting images");
        } finally {
            setLoading(false);
        }
    };

    // Helper to upload to Cloudinary
    const uploadToCloudinary = async (file: File | Blob, resourceType: "image" | "raw" | "auto" = "auto"): Promise<string> => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary not configured in .env.local");
        }

        const formData = new FormData();
        // Append Blob directly with filename to ensure extension is correct for RAW files
        // If it's a File object, it has a name, but we force it here just in case of Blob
        const fileName = (file instanceof File) ? file.name : "upload.pdf";
        formData.append("file", file, fileName);

        formData.append("upload_preset", uploadPreset);
        formData.append("folder", `student-vault/${department}`);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || "Cloudinary Upload Failed");
        }

        const data = await res.json();
        return data.secure_url;
    };




    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to upload.");
            return;
        }
        if (files.length === 0) {
            alert("Please upload a file.");
            return;
        }

        setLoading(true);
        try {
            const file = files[0];

            // Determine type: PDF -> raw, Image -> image
            const isPdf = file.type.includes("pdf") || file.name.endsWith(".pdf");
            const rType = isPdf ? "raw" : "image";

            const downloadURL = await uploadToCloudinary(file, rType);

            await addDoc(collection(db, "resources"), {
                title: `${subject} - ${moduleName}`,
                subject,
                module: moduleName,
                department,
                semester: Number(semester),
                faculty,
                year,
                fileUrl: downloadURL,
                fileType: file.type,
                status: "pending",
                contributorName: name || user.displayName || "Anonymous",
                contributorId: user.uid,
                contributorEmail: user.email,
                createdAt: serverTimestamp(),
                likes: 0,
                views: 0,
            });

            alert("Resource uploaded successfully! It is now pending approval.");
            router.push("/dashboard"); // Redirect to dashboard or stay
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 pt-24 flex justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
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
                                <input
                                    required
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                                />
                                <select
                                    required
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 text-black"
                                >
                                    <option value="" disabled className="text-slate-500">Select Department</option>
                                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id} className="text-black">{d.name}</option>)}
                                </select>
                                <select
                                    required
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 text-black"
                                >
                                    <option value="" disabled className="text-slate-500">Select Semester</option>
                                    {semesterOptions.map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                                </select>
                            </div>

                            {/* Academic Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Resource Details</h3>

                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400 ml-1">Subject</label>
                                    {subjectInputType === 'select' ? (
                                        <select
                                            required
                                            value={subject}
                                            onChange={(e) => {
                                                if (e.target.value === 'OTHER_CUSTOM') {
                                                    setSubjectInputType('text');
                                                    setSubject("");
                                                } else {
                                                    setSubject(e.target.value);
                                                }
                                            }}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 text-black"
                                        >
                                            <option value="" disabled>Select Subject</option>
                                            {availableSubjects.map((s) => (
                                                <option key={s} value={s} className="text-black">{s}</option>
                                            ))}
                                            <option value="OTHER_CUSTOM" className="text-pink-600 font-bold">+ Add New Subject</option>
                                        </select>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                placeholder="Enter Subject Name"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500 pr-20"
                                            />
                                            {availableSubjects.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setSubjectInputType('select'); setSubject(""); }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-violet-400 hover:underline"
                                                >
                                                    Show List
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <input
                                    required
                                    type="text"
                                    placeholder="Module No/Name"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="Faculty Name (Note Creator)"
                                    value={faculty}
                                    onChange={(e) => setFaculty(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Syllabus Year (e.g. 2022)"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        </div>

                        {/* File Upload / Converter */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-lg font-semibold text-white">Upload Files (Images to PDF)</h3>

                            {/* Warning for Image Uploads */}
                            {files.length > 0 && !files[0].type.includes("pdf") && !convertedPdf && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm flex items-center gap-2">
                                    <span className="font-bold">⚠️ Action Required:</span> Please convert your images to PDF before submitting.
                                </div>
                            )}

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

                                    {!convertedPdf && files.some(f => f.type.includes('image')) ? (
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
                            disabled={loading || (files.length > 0 && !files[0].type.includes("pdf") && !convertedPdf)}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Uploading..." : "Submit Resource"}
                        </button>


                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
