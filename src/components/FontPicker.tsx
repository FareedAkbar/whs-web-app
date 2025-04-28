"use client";

import { useEffect, useState } from "react";

const fonts = [
  { name: "Geist Sans", value: "var(--font-geist-sans)" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Lora", value: "Lora, serif" }, // Elegant and readable
  { name: "Lobster", value: "Lobster, cursive" }, // Stylish and bold
  { name: "Droid Serif", value: "'Droid Serif', serif" }, // Simple and elegant
];

export default function ThemeFontPicker() {
  const [currentFont, setCurrentFont] = useState<string>(
    "var(--font-geist-sans)",
  ); // Default font

  useEffect(() => {
    const savedFont = localStorage.getItem("font-family");
    if (savedFont) {
      setCurrentFont(savedFont);
      document.documentElement.style.setProperty("--font-family", savedFont);
    }
  }, []);

  const handleFontChange = (newFont: string) => {
    setCurrentFont(newFont);
    document.documentElement.style.setProperty("--font-family", newFont);
    localStorage.setItem("font-family", newFont);
  };

  return (
    <div className="flex flex-col items-start rounded-xl bg-gray-100 p-3 shadow-md">
      <label htmlFor="fontPicker" className="text-lg font-semibold">
        Choose your Font
      </label>
      <select
        id="fontPicker"
        value={currentFont}
        onChange={(e) => handleFontChange(e.target.value)}
        className="h-10 cursor-pointer rounded-md border-2 border-gray-300 shadow-md"
      >
        {fonts.map((font) => (
          <option key={font.name} value={font.value}>
            {font.name}
          </option>
        ))}
      </select>

      {/* Font name preview */}
      {/* <div className="mt-4 text-xl font-medium">
        {fonts.map((font) => (
          <div
            key={font.name}
            style={{
              fontFamily: font.value,
              marginBottom: "8px",
              fontSize: font.name === "Lobster" ? "1.5rem" : "1.25rem", // Adjusting size for Lobster
            }}
          >
            {font.name}
          </div>
        ))}
      </div> */}
    </div>
  );
}
