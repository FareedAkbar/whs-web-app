"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Label } from "@/components/ui/label"; // Update path if needed

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, error, required, ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: any) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <div className="mb-4 w-full">
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
          className="group/input rounded-lg p-[2px] transition duration-300"
        >
          <div className="relative w-full">
            <input
              type={isPassword && showPassword ? "text" : type}
              id={id}
              className={cn(
                `shadow-input dark:placeholder-text-neutral-600 duration-400 flex h-10 w-full rounded-md border border-[#ADADAD] bg-gray-50 px-3 py-2 text-sm text-black transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] dark:focus-visible:ring-neutral-600`,
                error && "border-red-500 focus-visible:ring-red-500",
                className,
              )}
              ref={ref}
              {...props}
            />

            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white"
              >
                {showPassword ? (
                  <IconEyeOff size={18} />
                ) : (
                  <IconEye size={18} />
                )}
              </button>
            )}
          </div>
        </motion.div>

        {error && (
          <p className="mt-1 text-sm not-italic text-red-600">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
