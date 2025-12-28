export const DEPARTMENTS = [
    { id: "cs", name: "Computer Science", icon: "Laptop" },
    { id: "is", name: "Information Science", icon: "Database" },
    { id: "ec", name: "Electronics & Comm", icon: "Radio" },
    { id: "me", name: "Mechanical", icon: "Wrench" },
    { id: "rb", name: "Robotics", icon: "Bot" },
    { id: "ai", name: "AI & ML", icon: "Brain" },
    { id: "mba", name: "MBA", icon: "Briefcase" },
    { id: "fy", name: "First Year", icon: "GraduationCap" },
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const SUBJECTS: Record<string, string[]> = {
    "cs-3": ["Data Structures", "Digital Electronics", "COA", "Discrete Math", "Unix Shell Programming"],
    "cs-4": ["Algorithms", "Operating Systems", "Microprocessors", "OOC", "Data Comm"],
    "cs-5": ["DBMS", "Computer Networks", "ATC", "Python", "Management"],
    // Add more as needed
};
