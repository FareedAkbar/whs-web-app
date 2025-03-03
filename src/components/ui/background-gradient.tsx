import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  onClick,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div onClick={onClick} className={cn("relative p-1 group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform overflow-hidden",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,theme(colors.white),transparent),radial-gradient(circle_farthest-side_at_100%_0,theme(colors.gray.300),transparent),radial-gradient(circle_farthest-side_at_100%_100%,theme(colors.gray.500),transparent),radial-gradient(circle_farthest-side_at_0_0,theme(colors.black),theme(colors.gray.900))] dark:bg-[radial-gradient(circle_farthest-side_at_0_100%,theme(colors.black),transparent),radial-gradient(circle_farthest-side_at_100%_0,theme(colors.gray.800),transparent),radial-gradient(circle_farthest-side_at_100%_100%,theme(colors.gray.600),transparent),radial-gradient(circle_farthest-side_at_0_0,theme(colors.white),theme(colors.gray.100))]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-xl z-[1] will-change-transform",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,theme(colors.white),transparent),radial-gradient(circle_farthest-side_at_100%_0,theme(colors.gray.300),transparent),radial-gradient(circle_farthest-side_at_100%_100%,theme(colors.gray.500),transparent),radial-gradient(circle_farthest-side_at_0_0,theme(colors.black),theme(colors.gray.900))] dark:bg-[radial-gradient(circle_farthest-side_at_0_100%,theme(colors.black),transparent),radial-gradient(circle_farthest-side_at_100%_0,theme(colors.gray.800),transparent),radial-gradient(circle_farthest-side_at_100%_100%,theme(colors.gray.600),transparent),radial-gradient(circle_farthest-side_at_0_0,theme(colors.white),theme(colors.gray.100))]"
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
