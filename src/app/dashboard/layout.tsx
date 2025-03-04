'use client';

import "@/styles/globals.css";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen flex justify-center items-center w-full sm:p-0 p-2" style={{ background: "url('/images/gradient.webp')", backgroundSize: "cover" }}>
            {children}
        </div>
    );
}
