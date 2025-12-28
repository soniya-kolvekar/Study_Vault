# Student Vault (Study Vault)

A centralized resource sharing platform for students to upload, access, and manage study materials like notes, question papers, and manuals.

## Project Overview

**Student Vault** is built to streamline the distribution of academic resources. It features a modern, glassmorphic UI, robust admin moderation tools, and efficient file handling including automatic PDF generation and compression.

## Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: TailwindCSS (Custom configuration) & Framer Motion (Animations)
- **Backend/Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Cloudinary (Optimized for documents)
- **PDF Generation**: jsPDF (Client-side image-to-PDF conversion)

## Key Features

- **Resource Upload**: Students can upload images (converted to PDF automatically) or native PDF files.
- **Dynamic Organization**: Resources are automatically organized by Department, Semester, and Subject.
- **Admin Dashboard**: Moderators can approve/reject uploads and delete invalid resources.
- **Smart Views**:
    - **PDF Viewer**: Embedded viewer with same-tab navigation.
    - **View Tracking**: Real-time view counters for trending resources.
- **Responsive Design**: Fully optimized for mobile and desktop screens.

## Setup Instructions

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Configure Environment Variables (`.env.local`):
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Logic Details

- **Departments**: Supported departments include CS, IS, EC, ME, RB, AI, MBA, and First Year.
- **Semesters**: Logic filters semesters based on department (e.g., FY: Sem 1-2, MBA: Sem 1-4).
- **Subjects**: Dropdowns are populated dynamically from existing database records + default constants.
