'use client'

import ThemeToggle from "@/components/ThemeToggle";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";


export default function TopBar() {
    const session = useSession();
    const [showNav, setShowNav] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const optionsRef = useRef(null);
    const options = [
        { value: "Profile", label: "Profile", icon: <Image width={100} height={100} className="w-4 h-4 rounded-full cursor-pointer" src={session.data?.user.image && session.data.user.image !== '' ? session.data.user.image : "/assets/user.webp"} alt="" /> },
        { value: "settings", label: "Settings", icon: <SettingsIcon className="icon stroke-[1px] w-4 h-4" /> },
        { value: "logout", label: "Logout", icon: <LogOutIcon className="icon stroke-[1px] w-4 h-4" /> },
    ];

    useOutsideClick(optionsRef, () => {
        setDropdownOpen(false)
    });

    const handleSignOut = async () => {
        try {
            await signOut({ callbackUrl: '/', redirect: true });
            router.push("/");
        } catch (error) {
            console.log(error);
        }
    };

    const onOptionSelect = async (option: { value: string, label: string, icon: JSX.Element }) => {
        if (option.value === "logout") await handleSignOut();
        if (option.value === "settings") router.push("/team");
        console.log("Selected:", option.value);
    };

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
        <div className="flex items-center justify-between gap-4 bg-transparent w-full py-4">
            <div className="flex font-nulshock text-3xl">
                <span className="text-white">WHS</span>
                <span className="text-red-700">APP</span>
            </div>
            <div className="flex">
                {session.data?.user.email ? (
                    <div className=" flex items-center gap-4">
                        <Link href={"/dashboard"} className="text-white text-sm font-medium">
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2 relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                disabled={dropdownOpen}
                                className="flex items-center gap-2 p-[1px] bg-transparent rounded-full"
                            >
                                <Image
                                    width={100}
                                    height={100}
                                    className="w-8 h-8 border border-transparent rounded-full hover:border-white hover:bg-white cursor-pointer"
                                    src={session.data?.user.image && session.data.user.image !== '' ? session.data.user.image : "/assets/user.webp"}
                                    alt=""
                                />
                            </button>

                            <div
                                ref={optionsRef}
                                className={"absolute right-0 top-10 w-full min-w-56 shadow-lg border dark:border-[#F8EDED]/20 bg-white dark:bg-white rounded-md py-2 z-[9999] dark:text-black text-black p-2" + (dropdownOpen ? "" : " hidden")}
                            >
                                <div>
                                    <div className="flex flex-col items-start p-2">
                                        <p className="text-sm">{session.data?.user.name}</p>
                                        <p className="text-xs text-neutral-400">{session.data?.user.email}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-neutral-200 border-[0.5px] border-gray-100/20 mb-[1px]"></div>
                                {options.map((option, index) => (
                                    <>
                                        {index === (options.length - 1) && < div className="w-full bg-neutral-200 border-[0.5px] border-gray-100/20 my-[1px]"></div >}
                                        <button
                                            key={index}
                                            onClick={() => onOptionSelect(option)}
                                            className="flex items-center gap-2 w-full rounded px-2 py-2 dark:text-black text-black dark:hover:bg-neutral-200 hover:bg-[#141d2b] text-sm font-light overflow-x-hidden"
                                        >
                                            {option.icon}
                                            <span>{option.label}</span>
                                        </button>
                                    </>

                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link className="text-white px-4 py-1 bg-red-700 rounded" href="/auth/login">
                        Login
                    </Link>
                )
                }
            </div>
        </div >
    );
}