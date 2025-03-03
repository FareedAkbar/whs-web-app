'use client';

import React, { useState, useEffect, createContext, type ReactNode, type FC } from "react";

const getInitialTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.localStorage) {
        const storedPreference = window.localStorage.getItem("color-theme");
        if (typeof storedPreference === "string") {
            return storedPreference as "light" | "dark";
        }

        const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
        if (userMedia.matches) {
            return "dark";
        }
    }
    return "light";
};

// Define the type for the context value
interface ThemeContextType {
    theme: "light" | "dark";
    setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

// Create the ThemeContext
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define props for the ThemeProvider
interface ThemeProviderProps {
    initialTheme?: "light" | "dark";
    children: ReactNode;
}

// ThemeProvider Component
export const ThemeProvider: FC<ThemeProviderProps> = ({ initialTheme, children }) => {

    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const theme = getInitialTheme();
        setTheme(theme);
    }, []);

    const rawSetTheme = (theme: "light" | "dark") => {
        const root = window.document.documentElement;
        const isDark = theme === "dark";

        root.classList.remove(isDark ? "light" : "dark");
        root.classList.add(theme);

        localStorage.setItem("color-theme", theme);
    };

    useEffect(() => {
        if (initialTheme) {
            rawSetTheme(initialTheme);
        }
    }, [initialTheme]);

    useEffect(() => {
        rawSetTheme(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
