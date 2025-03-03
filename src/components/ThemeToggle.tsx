'use client';

import { ThemeContext } from "@/providers/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";
import React, { useContext } from "react";

const ThemeToggle = ({ hide }: { hide: boolean }) => {
    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error("ThemeToggle must be used within a ThemeProvider");
    }

    const { theme, setTheme } = themeContext;

    return (
        <div className={"flex items-center gap-2 justify-center dark:text-white text-black" + (hide ? " p-2" : "")}>
            {theme === "dark" ? (
                <div
                    className="flex items-center cursor-pointer gap-2"
                    onClick={() => setTheme("light")}
                >
                    <SunIcon className={"text-primary text-xl text-yellow-500" + (hide ? "" : "icon stroke-[1px] w-4 h-4")} />
                    {!hide && "Theme"}
                </div>
            ) : (
                <div
                    className="flex items-center cursor-pointer gap-2"
                    onClick={() => setTheme("dark")}
                >
                    <MoonIcon className={"text-primary text-xl text-yellow-500" + (hide ? "" : "icon stroke-[1px] w-4 h-4")} />
                    {!hide && "Theme"}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
