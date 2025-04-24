"use client";

import Image from "next/image";
import TopBar from "../_components/topbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const session = useSession();
  useEffect(() => {
    void session.update();
  }, []);

  return (
    <main className="h-full w-full bg-white">
      <div className="flex h-full w-full items-center justify-center gap-4 bg-[#160104]">
        <div className="container flex h-full w-full flex-col items-center justify-center">
          {/* <TopBar /> */}
          <div className="flex h-[70vh] w-full items-center justify-between gap-4">
            <div className="flex w-full flex-col items-start justify-start gap-4">
              <div className="flex flex-col items-start justify-start">
                <span className="text-center text-5xl font-bold text-white">
                  Hazard Safety app for
                </span>
                <span className="text-center text-5xl font-bold text-red-700">
                  UOW PULSE
                </span>
              </div>
              <p className="w-[80%] text-start text-white">
                Your safety matters! Use this app to quickly report hazards and
                incidents, ensuring a safer workplace for everyone.
              </p>
              <div className="flex w-fit flex-col items-start justify-start gap-4">
                <Link
                  className="group flex w-full gap-2 rounded bg-red-700 px-6 py-2 text-white"
                  href={
                    session.status === "authenticated"
                      ? "/dashboard"
                      : "/auth/login"
                  }
                >
                  Get Started
                  <span className="translate-x-0 transform transition-transform duration-300 group-hover:translate-x-2">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
            <div className="h-full w-full">
              <Image
                width={1000}
                height={1000}
                src="/images/whs.svg"
                alt="hero"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
