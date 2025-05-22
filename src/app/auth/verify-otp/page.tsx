"use client";
import React, { createRef, useMemo } from "react";
import Button from "@/components/ui/Button";
import { IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const otpRefs = useMemo(
    () => Array.from({ length: 4 }, () => createRef<HTMLInputElement>()),
    [],
  );

  const handleChange = (index: number, value: string) => {
    if (value && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  const handleNext = () => {
    // Validate OTP logic
    router.push("/auth/reset-password");
  };

  return (
    <div className="container w-full rounded-2xl bg-white p-4 text-black shadow-2xl dark:bg-white/30 dark:text-black sm:w-[450px] md:p-8">
      <h2 className="text-3xl font-bold text-primary">Enter OTP</h2>
      <p className="mt-2 text-sm text-gray-500">
        We have sent an OTP to your email. Please enter it below.
      </p>

      <div className="my-6 flex justify-between gap-2">
        {otpRefs.map((ref, i) => (
          <input
            key={i}
            ref={ref}
            maxLength={1}
            type="text"
            inputMode="numeric"
            className="h-12 w-12 rounded-md border border-primary text-center text-lg text-primary outline-none"
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      <div className="flex gap-5 pt-4">
        <Button
          title="Back"
          variant="secondary"
          onClick={() => router.push("/auth/forgot-password")}
        />
        <Button title="Next" icon={<IconChevronRight />} onClick={handleNext} />
      </div>
    </div>
  );
}
