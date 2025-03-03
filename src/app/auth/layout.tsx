'use client';

import "@/styles/globals.css";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    const session = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session.status === "authenticated") {
            window.location.href = "/";
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="relative min-h-screen flex justify-center items-center w-full">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#342a73]"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex justify-center items-center w-full sm:p-0 p-2" style={{ background: "url('/images/gradient.webp')", backgroundSize: "cover" }}>
            <div className="relative z-50 flex justify-center items-center h-full w-full overflow-auto">
                <Link href={"/"} className="fixed top-0 left-0 p-4 flex justify-start items-center gap-4 dark:text-white text-white">
                    <ArrowLeft className="cursor-pointer" />
                    Back
                </Link>
            </div>
            {children}
        </div>
    );
}
