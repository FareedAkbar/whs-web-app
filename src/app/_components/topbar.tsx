"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { IconHelp } from "@tabler/icons-react";
import { LogOutIcon, MenuIcon, SettingsIcon, UserRound } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import ThemeColorPicker from "@/components/ThemeColorPicker";
import ThemeFontPicker from "@/components/FontPicker";

export default function TopBar({ toggleDrawer }: { toggleDrawer: () => void }) {
  const session = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const optionsRef = useRef(null);
  // const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
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
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () => {
        setDropdownOpen(false);
      });
    }
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [dropdownOpen]);

  return (
    <div className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 dark:bg-gray-950 dark:text-white">
      <button className="block md:hidden" onClick={toggleDrawer}>
        <MenuIcon size={28} />
      </button>
      <div
        className="flex cursor-pointer text-2xl"
        // onClick={() => router.push("/dashboard")}
      >
        <span className="pl-6 font-semibold capitalize">
          {path.split("/")[2] ?? path.split("/")[1]}
        </span>
      </div>
      <div className="flex">
        {session.data?.user.email ? (
          <div className="flex items-center gap-4">
            <Link
              href={"/dashboard"}
              className="rounded-full bg-[#F2F2F2] p-3 dark:bg-gray-800"
            >
              <IconHelp size={20} />
            </Link>
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={dropdownOpen}
                className="flex items-center gap-2 rounded-full bg-[#F2F2F2] p-3 dark:bg-gray-800"
              >
                {session.data?.user.image && session.data.user.image !== "" ? (
                  <Image
                    width={100}
                    height={100}
                    className="h-12 w-12 cursor-pointer rounded-full border border-transparent hover:border-white hover:bg-white"
                    src={session.data.user.image}
                    alt=""
                  />
                ) : (
                  <UserRound
                    size={20}
                    // className="rounded-full bg-[#F2F2F2] p-3"
                  />
                )}
              </button>
              <ThemeToggle hide />
              {/* <ThemeColorPicker />
              <ThemeFontPicker /> */}
              <div
                ref={optionsRef}
                className={
                  "absolute right-0 top-10 z-[9999] w-full min-w-56 rounded-md border bg-white p-2 py-2 text-black shadow-lg transition-all duration-300 dark:border-[#F8EDED]/20 dark:bg-gray-800 dark:text-black dark:text-white" +
                  (dropdownOpen ? "" : " hidden")
                }
              >
                <div>
                  <div className="flex flex-col items-start p-2">
                    <p className="text-sm capitalize">
                      {session.data?.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.data?.user.email}
                    </p>
                  </div>
                </div>
                <div className="mb-[1px] w-full border-[0.5px] border-gray-100/20 bg-gray-200 dark:border-gray-600"></div>
                {options.map((option, index) => (
                  <Fragment key={index}>
                    {index === options.length - 1 && (
                      <div className="my-[1px] w-full border-[0.5px] border-gray-100/20 bg-gray-200 dark:border-gray-600"></div>
                    )}
                    <button
                      onClick={() => onOptionSelect(option)}
                      className="flex w-full items-center gap-2 overflow-x-hidden rounded px-2 py-2 text-sm font-light text-black hover:bg-[#e9e8e8] dark:text-white dark:hover:bg-gray-600"
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
      {/* <Sidebar isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} /> */}
    </div>
  );
}
