"use client";

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
    <div
      className={
        "flex items-center justify-center gap-2 text-black dark:text-white" +
        (hide ? " p-2" : "")
      }
    >
      {theme === "dark" ? (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-full bg-primary p-2"
          onClick={() => setTheme("light")}
        >
          <SunIcon
            className={
              "text-xl text-white " + (hide ? "" : "icon h-4 w-4 stroke-[1px]")
            }
          />
          {!hide && "Theme"}
        </div>
      ) : (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-full bg-primary p-2"
          onClick={() => setTheme("dark")}
        >
          <MoonIcon
            className={
              "text-xl text-white " + (hide ? "" : "icon h-4 w-4 stroke-[1px]")
            }
          />
          {!hide && "Theme"}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
