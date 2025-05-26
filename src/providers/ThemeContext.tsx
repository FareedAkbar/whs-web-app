"use client";

import React, {
  useState,
  useEffect,
  createContext,
  type ReactNode,
  type FC,
} from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("color-theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      const finalTheme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : prefersDark
            ? "dark"
            : "light";

      setTheme(finalTheme);
      document.documentElement.classList.add(finalTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove(
        theme === "dark" ? "light" : "dark",
      );
      document.documentElement.classList.add(theme);
      window.localStorage.setItem("color-theme", theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
