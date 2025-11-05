"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string }[];
  selectedValue?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      id,
      error,
      required,
      options,
      selectedValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    }

    return (
      <div className="relative mb-4 w-full">
        {label && (
          <Label htmlFor={id} className="mb-1 block text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}

        <motion.div
          style={{
            background: useMotionTemplate`
              radial-gradient(
                ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
                var(--blue-500),
                transparent 80%
              )
            `,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="group/input relative rounded-lg p-[2px] transition duration-300"
        >
          <select
            ref={ref}
            id={id}
            value={selectedValue}
            onChange={onChange}
            className={cn(
              `shadow-input flex h-10 w-full cursor-pointer appearance-none rounded-md border bg-gray-50 px-3 py-2 pr-10 text-sm text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white`,
              error && "border-red-500 focus-visible:ring-red-500",
              className,
            )}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </motion.div>

        {error && (
          <p className="mt-1 text-sm not-italic text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export { Select };
