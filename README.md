# 🚀 StudyVault
> **The Ultimate Academic Resource Hub for Sahyadri College of Engineering**

![StudyVault Banner](https://img.shields.io/badge/StudyVault-v1.0-violet?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-0F172A?style=for-the-badge&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integration-blue?style=for-the-badge)

StudyVault is a **real-time, modern web application** designed to revolutionize how students share and access academic resources. From lecture notes to question papers, everything is organized, searchable, and enhanced by an **embedded AI Study Assistant**.

🔗 **Live Demo:** [https://study-vault-beige.vercel.app](https://study-vault-beige.vercel.app)

---

## ✨ Key Features

### 🧠 **AI-Powered Study Companion (New!)**
- **Smart Context**: The AI assistant knows exactly which folder or subject you are viewing.
- **Document Analysis**: Click "View File" and ask the AI to **summarize**, **extract key topics**, or **quiz you** on the content—instantly.
- **Deep Integration**: Powered by Google's **Gemini Pro**, capable of reading full PDFs directly from the server.
- **Persistent Chat**: Your study conversations are saved to your profile for future reference.

### 📚 **Resource Management**
- **Dynamic Organization**: Resources are automatically sorted by Department, Semester, and Subject.
- **Universal Access**: Upload native PDFs or images (automatically converted to PDF).
- **Real-Time Sync**: New uploads, likes, and view counts update instantly across all connected devices using Firestore listeners.

### ⚡ **Modern Experience**
- **Glassmorphism UI**: A premium, dark-mode aesthetic built with Tailwind CSS and Framer Motion.
- **Interactive Engagement**: "Confetti" animations on likes and interactive cards.
- **Mobile First**: Fully responsive design that works perfectly on phones and tablets.

### 🛡️ **Secure & Moderated**
- **Google Authentication**: Seamless sign-in with institutional email support.
- **Role-Based Access**: Specialized Admin dashboard for moderating content and managing resources.
- **Saved Collection**: Bookmark important notes to your personal profile.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/)
- **Storage**: Cloudinary (High-performance asset delivery)

---

## 🚀 Getting Started Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/soniya-kolvekar/Study_Vault.git
    cd Study_Vault
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file with your keys:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    GEMINI_API_KEY=...
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 👥 Contributors

- **Soniya Kolvekar** (Team Lead)
- **Tanish Poojari**
- **Saishree Shet**
- **Varun**

---
*Built with ❤️ for the students of Sahyadri College.*
