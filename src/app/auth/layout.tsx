"use client";

import "@/styles/globals.css";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // console.log("Session :", session);
    if (
      session.status === "authenticated" &&
      session.data.user.role !== "UNDEFINED"
    ) {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-full bg-gradient-to-r from-red-500 to-red-800 lg:w-1/2" />
        <div className="hidden w-1/2 bg-white lg:block" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex h-full min-h-screen w-full flex-1 flex-col lg:flex-row">
        {/* Left Side: Form/Content */}
        <div className="flex w-full flex-1 items-center justify-center py-10 lg:h-screen lg:w-1/2 lg:py-0">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Right Side: Image (hidden on small screens) */}
        <div className="hidden w-1/2 items-center justify-center lg:flex">
          <Image
            src="/images/auth-bg.png"
            alt="Right side illustration"
            width={400}
            height={400}
            className="max-h-[80%] max-w-[60%] object-contain opacity-20"
          />
        </div>
      </div>
    </div>
  );
}
