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
      className="items- justify- relative flex min-h-screen w-full p-2 sm:p-0"
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
