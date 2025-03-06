"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

export default function TopBar() {
  const session = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const optionsRef = useRef(null);
  console.log("ss", session);
  const options = [
    {
      value: "Profile",
      label: "Profile",
      icon: (
        <Image
          width={100}
          height={100}
          className="h-4 w-4 cursor-pointer rounded-full"
          src={
            session.data?.user.image && session.data.user.image !== ""
              ? session.data.user.image
              : "/images/user.webp"
          }
          alt=""
        />
      ),
    },
    {
      value: "settings",
      label: "Settings",
      icon: <SettingsIcon className="icon h-4 w-4 stroke-[1px]" />,
    },
    {
      value: "logout",
      label: "Logout",
      icon: <LogOutIcon className="icon h-4 w-4 stroke-[1px]" />,
    },
  ];

  useOutsideClick(optionsRef, () => {
    setDropdownOpen(false);
  });

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/", redirect: true });
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const onOptionSelect = async (option: {
    value: string;
    label: string;
    icon: JSX.Element;
  }) => {
    if (option.value === "logout") await handleSignOut();
    if (option.value === "settings") router.push("/team");
    console.log("Selected:", option.value);
  };
  const path = usePathname();
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    // on scroll
    window.addEventListener("scroll", () => {
      setDropdownOpen(false);
    });

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dropdownOpen]);

  return (
    <div className="flex w-full items-center justify-between gap-4 bg-white p-4">
      <div
        className="flex cursor-pointer text-2xl"
        // onClick={() => router.push("/dashboard")}
      >
        <span className="pl-6 font-semibold capitalize">
          {path.split("/")[2]}
        </span>
      </div>
      <div className="flex">
        {session.data?.user.email ? (
          <div className="flex items-center gap-4">
            <Link
              href={"/dashboard"}
              className="text-sm font-medium text-black"
            >
              Dashboard
            </Link>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={dropdownOpen}
                className="flex items-center gap-2 rounded-full bg-transparent p-[1px]"
              >
                <Image
                  width={100}
                  height={100}
                  className="h-8 w-8 cursor-pointer rounded-full border border-transparent hover:border-white hover:bg-white"
                  src={
                    session.data?.user.image && session.data.user.image !== ""
                      ? session.data.user.image
                      : "/images/user.webp"
                  }
                  alt=""
                />
              </button>

              <div
                ref={optionsRef}
                className={
                  "absolute right-0 top-10 z-[9999] w-full min-w-56 rounded-md border bg-white p-2 py-2 text-black shadow-lg dark:border-[#F8EDED]/20 dark:bg-white dark:text-black" +
                  (dropdownOpen ? "" : " hidden")
                }
              >
                <div>
                  <div className="flex flex-col items-start p-2">
                    <p className="text-sm capitalize">
                      {session.data?.user.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {session.data?.user.email}
                    </p>
                  </div>
                </div>
                <div className="mb-[1px] w-full border-[0.5px] border-gray-100/20 bg-neutral-200"></div>
                {options.map((option, index) => (
                  <Fragment key={index}>
                    {index === options.length - 1 && (
                      <div className="my-[1px] w-full border-[0.5px] border-gray-100/20 bg-neutral-200"></div>
                    )}
                    <button
                      onClick={() => onOptionSelect(option)}
                      className="flex w-full items-center gap-2 overflow-x-hidden rounded px-2 py-2 text-sm font-light text-black hover:bg-[#e9e8e8] dark:text-black dark:hover:bg-neutral-200"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Link
            className="rounded bg-red-700 px-4 py-1 text-white"
            href="/auth/login"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
