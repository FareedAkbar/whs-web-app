"use client";

import "@/styles/globals.css";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TopBar from "../_components/topbar";
import Sidebar from "../_components/sidebar";
import { redirect, useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const isVerified =
    session?.data?.user?.isVerifiedByAdmin?.toString() === "true";

  const getSes = getSession();
  console.log("sessionnnn", session, "getsession", getSes);

  // const router = useRouter();
  // useEffect(() => {
  //   const checkSession = async () => {
  //     const session = await getSession();
  //     console.log(session, "sessss");
  //     if (session?.user?.role === "UNDEFINED") {
  //       router.replace("/auth/on-boarding");
  //     } else {
  //       router.replace("/dashboard");
  //     }
  //   };

  //   checkSession();
  // }, []);

  // if (session.status === "loading") {
  //   return (
  //     <div className="flex h-screen w-screen items-center justify-center">
  //       Loading...
  //     </div>
  //   );
  // } else
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
  } else if (!isVerified) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-md">
          <AlertTriangle className="mb-4 h-16 w-16 text-primary" />
          <h1 className="mb-2 text-3xl font-bold text-primary">
            Admin Pending Approval
          </h1>
          <p className="mb-4 text-lg text-gray-700">
            You are not authorized to access this page yet.
          </p>
        </div>
      </div>
    );
  }
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
