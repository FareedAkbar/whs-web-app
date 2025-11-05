"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { IconChevronRight } from "@tabler/icons-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";

// ✅ Validation schema
const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CreatePasswordInput = z.infer<typeof schema>;

export default function CreatePasswordScreen() {
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const email = searchParams?.get("email") ?? "";
  const code = searchParams?.get("from") ?? ""; // if sent from verify page

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordInput>({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const mutation = api.auth.createPassword.useMutation();

  const onSubmit = async (data: CreatePasswordInput) => {
    if (!email || !code) {
      toast.error("Invalid link or missing parameters.");
      return;
    }

    setLoading(true);
    try {
      await mutation.mutateAsync({
        email,
        password: data.password,
        code,
      });
      toast.success("Password created successfully!");
      router.push("/auth/login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        toast.error(
          (err as { message?: string }).message ?? "Failed to create password",
        );
      } else {
        toast.error("Failed to create password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container w-full rounded-2xl bg-white/80 p-4 text-black shadow-2xl dark:bg-gray-950/60 dark:text-white sm:w-[450px] md:p-8">
      <h2 className="text-3xl font-bold text-primary">Create Password</h2>
      <p className="mt-2 text-sm text-gray-500">
        Set a new password for your account.
      </p>

      <form className="my-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Display */}
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <div className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {email ?? "No email found"}
          </div>
        </div>

        {/* Password */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="password"
              type="password"
              label="Password"
              required
              error={errors.password?.message}
            />
          )}
        />

        {/* Confirm Password */}
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              required
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <div className="flex gap-5 pt-4">
          <Button
            title="Back"
            variant="secondary"
            onClick={() => router.back()}
          />
          <Button
            title={loading ? "Creating..." : "Create"}
            icon={<IconChevronRight size={12} />}
            type="submit"
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
}
