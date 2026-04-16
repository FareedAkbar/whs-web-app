"use client";

import "@/styles/globals.css";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TopBar from "../_components/topbar";
import Sidebar from "../_components/sidebar";
import { redirect } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const isVerified =
    session?.data?.user?.isVerifiedByAdmin?.toString() === "true";
  console.log("session", session);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  if (session?.data?.user?.role == "UNDEFINED") {
    redirect("/auth/on-boarding");
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
  } else if (session.data?.user?.role !== "ADMIN" && !isVerified) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white bg-[url('/images/whs-web-bg.png')] bg-cover p-2 dark:bg-gray-950 sm:p-0">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
          <AlertTriangle className="mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 text-3xl font-bold text-primary">
            Admin Pending Approval
          </h1>
          <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
            You are not authorized to access this page yet.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-screen w-full bg-white bg-[url('/images/whs-web-bg.png')] bg-cover p-2 dark:bg-gray-950 sm:p-0">
      <div className="flex h-screen w-screen flex-col">
        <div className="relative flex h-full w-full overflow-hidden">
          <Sidebar isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />

          <div className="flex flex-1 flex-col">
            {/* TopBar - fixed height */}
            <div className="h-fit shrink-0">
              <TopBar toggleDrawer={toggleDrawer} />
            </div>

            {/* Scrollable children area */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
