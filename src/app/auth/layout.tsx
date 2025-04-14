"use client";

import "@/styles/globals.css";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Session :", session);
    if (session.status === "authenticated") {
      window.location.href = "/";
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-2 sm:p-0"
      style={{
        background: "url('/images/gradient.webp')",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-50 flex h-full w-full items-center justify-center overflow-auto">
        <Link
          href={"/"}
          className="fixed left-0 top-0 flex items-center justify-start gap-4 p-4 text-white dark:text-white"
        >
          <ArrowLeft className="cursor-pointer" />
          Back
        </Link>
      </div>
      {children}
    </div>
  );
}
