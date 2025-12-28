export type UserRole = "student" | "admin" | "faculty";

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    department?: string;
    semester?: number;
    role: UserRole;
    createdAt: number;
}

export interface ResourceMetadata {
    id: string;
    title: string; // Module No/Name
    description?: string;
    subject: string;
    department: string;
    semester: number;
    syllabusYear: number;
    facultyName: string; // Note Creator
    contributorId: string;
    contributorName: string;
    fileUrl: string;
    fileType: "pdf" | "image" | "other";
    viewCount: number;
    likeCount: number;
    createdAt: number;
    sourceReference?: string;
}

export interface Comment {
    id: string;
    resourceId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: number;
}
