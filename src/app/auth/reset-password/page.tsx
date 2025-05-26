"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ResetPasswordInput) => {
    // Password reset logic here
    toast.success("Password reset successfully");
    router.push("/auth/login");
  };
  const password = watch("password");

  return (
    <div className="container w-full rounded-2xl bg-white p-4 text-black shadow-2xl sm:w-[450px] md:p-8 dark:bg-white/30 dark:text-black">
      <h2 className="text-3xl font-bold text-primary">Reset Password</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enter your new password below to complete the reset.
      </p>

      <form className="my-6" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              id="password"
              label="New Password"
              required
              error={errors.password?.message}
              className="bg-neutral-200/20 text-black dark:bg-neutral-200/20"
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Confirm Password is required",
            validate: (value) =>
              value === password || "Passwords do not match.",
          }}
          render={({ field }) => (
            <Input
              {...field}
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              required
              error={errors.confirmPassword?.message}
              className="bg-neutral-200/20 text-black dark:bg-neutral-200/20"
            />
          )}
        />

        <div className="flex gap-5 pt-4">
          <Button
            title="Back"
            variant="secondary"
            onClick={() => router.push("/auth/verify-otp")}
          />
          <Button title="Submit" icon={<IconChevronRight />} type="submit" />
        </div>
      </form>
    </div>
  );
}
