import React, { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownProps {
  button: ReactNode;
  children: ReactNode;
  className?: string;
  dropdownClassName?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  isOpen?: boolean; // ✅ Controlled from parent (optional)
  setIsOpen?: (value: boolean) => void; // ✅ Controlled setter (optional)
}

const getPositionClasses = (position: DropdownProps["position"]) => {
  switch (position) {
    case "top-left":
      return "bottom-full left-0 mb-0.5";
    case "top-right":
      return "bottom-full right-0 mb-0.5";
    case "bottom-left":
      return "top-full left-0 mt-0.5";
    case "bottom-right":
    default:
      return "top-full right-0 mt-0.5";
  }
};

const Dropdown: React.FC<DropdownProps> = ({
  button,
  children,
  className = "",
  dropdownClassName = "",
  position = "bottom-right",
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = setControlledIsOpen ?? setInternalIsOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {button}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 min-w-[10rem] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-600 dark:bg-gray-700 ${getPositionClasses(
              position,
            )} ${dropdownClassName}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
