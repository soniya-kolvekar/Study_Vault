"use client";

import LoginButton from "@/components/auth/LoginButton";
import { motion } from "framer-motion";
import { BookOpen, Share2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && (
        <div className="fixed top-0 left-0 w-full bg-red-600/90 text-white p-4 z-50 text-center font-bold">
          ⚠️ Critical: Firebase Config Missing. Please create .env.local with your keys.
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="z-10 flex flex-col items-center max-w-4xl mx-auto space-y-8"
      >
        <motion.div variants={item} className="space-y-4">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-violet-200 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Exclusively for Sahyadri Students</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-violet-100 to-violet-300 drop-shadow-lg px-4">
            STUDY<span className="text-violet-500">VAULT</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
            The ultimate academic resource hub. <br />
            <span className="text-violet-400 font-semibold">Share</span>, <span className="text-pink-400 font-semibold">Discover</span>, and <span className="text-cyan-400 font-semibold">Ace</span> your exams.
          </p>
        </motion.div>

        <motion.div variants={item} className="pt-8">
          <LoginButton />
        </motion.div>

        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full"
        >
          {[
            {
              icon: Share2,
              title: "Share Notes",
              desc: "Upload and share your high-quality notes with peers.",
              color: "text-blue-400"
            },
            {
              icon: BookOpen,
              title: "Access Resources",
              desc: "Get instant access to module-wise syllabus and materials.",
              color: "text-pink-400"
            },
            {
              icon: Zap,
              title: "AI Powered",
              desc: "Find topics instantly with our built-in AI assistant.",
              color: "text-amber-400"
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
              className="glass-panel p-6 rounded-2xl space-y-3 transition-colors"
            >
              <feature.icon className={`w-8 h-8 ${feature.color}`} />
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
