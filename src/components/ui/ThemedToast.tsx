// src/components/ui/ThemedToast.tsx
"use client";

import { useTheme } from "@/providers/ThemeContext";
import { ToastContainer } from "react-toastify";

export default function ThemedToast() {
  const { theme } = useTheme(); // adjust to match your ThemeContext shape

  return (
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      progressClassName="bg-blue-600"
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"} // "dark" | "light" | "colored"
    />
  );
}
