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
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-2 sm:p-0"
      style={{
        background: "url('/images/gradient.webp')",
        backgroundSize: "cover",
      }}
    >
      <TopBar />
      <Sidebar />
      {children}
    </div>
  );
}
