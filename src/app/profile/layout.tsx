import { Navbar } from "@/components/ui/Navbar";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
