"use client";

import { useEffect, useState } from "react";

export default function ThemeColorPicker() {
  const [currentColor, setCurrentColor] = useState<string>("#ec1c29"); // default color in HEX

  useEffect(() => {
    const savedColor = localStorage.getItem("primary-color");
    if (savedColor) {
      setCurrentColor(savedColor);
      updateCSSVariable(savedColor);
    }
  }, []);

  const updateCSSVariable = (hexColor: string) => {
    // Convert HEX to RGB
    const rgb = hexToRgb(hexColor);
    if (rgb) {
      document.documentElement.style.setProperty(
        "--primary-color",
        `${rgb.r} ${rgb.g} ${rgb.b}`,
      );
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setCurrentColor(newHex);
    localStorage.setItem("primary-color", newHex);
    updateCSSVariable(newHex);
  };

  const hexToRgb = (hex: string) => {
    const match = hex.replace("#", "").match(/.{1,2}/g);
    if (!match) return null;
    const [r, g, b] = match.map((x) => parseInt(x, 16));
    return { r, g, b };
  };

  return (
    <input
      id="colorPicker"
      type="color"
      value={currentColor}
      onChange={handleColorChange}
      className="h-10 w-10 cursor-pointer"
    />
  );
}
