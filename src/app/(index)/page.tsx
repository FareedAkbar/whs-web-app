'use client';

import Image from "next/image";
import TopBar from "../_components/topbar";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const session = useSession();
  return (
    <main className="bg-white w-full h-full">
      <div className="flex items-center justify-center gap-4 bg-[#160104] w-full h-full">
        <div className="container flex flex-col justify-center items-center h-full w-full">
          <TopBar />
          <div className="flex items-center justify-between gap-4 w-full h-[70vh]">
            <div className="flex flex-col items-start justify-start gap-4 w-full">
              <div className="flex flex-col items-start justify-start">
                <span className="text-white text-5xl font-bold text-center">
                  Hazard Safety app for
                </span>
                <span className="text-red-700 text-5xl font-bold text-center">
                  ORGANIZATIONS
                </span>
              </div>
              <p className="text-white text-start w-[80%]">
                Your safety matters! Use this app to quickly report hazards and incidents, ensuring a safer workplace for everyone.
              </p>
              <div className="flex flex-col items-start justify-start w-fit gap-4">
                <Link className="text-white px-6 py-2 bg-red-700 rounded group w-full gap-2 flex" href={session.status === "authenticated" ? "/dashboard" : "/auth/login"}>
                  Get Started
                  <span className="transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
            <div className="w-full h-full">
              <Image
                width={1000}
                height={1000}
                src="/images/whs.svg"
                alt="hero"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
