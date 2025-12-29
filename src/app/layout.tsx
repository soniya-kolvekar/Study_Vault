import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatBot } from "@/components/ui/ChatBot";
import { Footer } from "@/components/ui/Footer"; // Import Footer

import { Inter } from "next/font/google"; // 1

const inter = Inter({ subsets: ["latin"] }); // 2

export const metadata: Metadata = {
  title: "StudyVault - Sahyadri Resource Hub",
  description: "Share and discover academic resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
