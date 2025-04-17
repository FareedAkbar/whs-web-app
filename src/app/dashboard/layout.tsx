"use client";

import "@/styles/globals.css";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TopBar from "../_components/topbar";
import Sidebar from "../_components/sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  if (session.status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Loading...
      </div>
    );
  } else if (session.status === "unauthenticated") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Unauthorized</h1>
          <p className="text-lg">You are not authorized to access this page.</p>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-primary"
          >
            <ArrowLeft />
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="items- justify- n relative flex w-full p-2 sm:p-0"
      style={{
        background: "url('/images/whs-web-bg.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="flex h-screen w-screen flex-col">
        <div className="relative flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <TopBar />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
