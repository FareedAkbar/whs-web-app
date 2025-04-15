"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import Button from "@/components/ui/Button";
import { IconChevronRight } from "@tabler/icons-react";
import { Select } from "@/components/ui/Select";

const inputs = z.object({
  fName: z.string().min(4, "First name must be at least 4 characters"),
  lName: z.string().min(4, "Last name must be at least 4 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(8, "Confirm Password must be at least 8 characters"),
  role: z.enum(["WORKER", "EMPLOYEE"]),
});

type InputType = z.infer<typeof inputs>;

export default function Register() {
  const router = useRouter();
  const registerUser = api.auth.register.useMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(inputs),
  });

  const onSubmit = async (data: InputType) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    toast.loading("Creating account...");
    await registerUser.mutateAsync(
      {
        phone: data.phone,
        name: data.fName + " " + data.lName,
        email: data.email,
        password: data.password,
        role: data.role,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("Account created successfully");
          router.push(`/auth/login`);
        },
        onError: (error) => {
          toast.dismiss();
          console.error("Failed to create account:", error);
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };

  return (
    <div className="font-geist font-geist container w-full rounded-2xl bg-white p-4 text-black shadow-2xl backdrop-blur-xl sm:m-0 sm:w-[450px] md:p-8 dark:bg-white/30 dark:text-black">
      <div className="flex text-3xl">
        <span className="font-bold text-primary">Sign Up</span>
      </div>
      <p className="mt-2 max-w-sm text-xs text-gray-500">
        Fill in your details below and Sign up
      </p>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-2">
          <Controller
            name="fName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="fName"
                type="text"
                label="First Name"
                required
                error={errors.fName?.message}
              />
            )}
          />

          <Controller
            name="lName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="lName"
                type="text"
                label="Last Name"
                error={errors.lName?.message}
                required
              />
            )}
          />
        </div>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              label="Email"
              required
              error={errors.email?.message}
              className="bg-neutral-200/20 text-black backdrop-blur-lg dark:bg-neutral-200/20 dark:text-black"
            />
          )}
        />
        <div className="flex gap-2">
          <Controller
            name="phone"
            control={control}
            rules={{
              required: "Phone number is required",
              minLength: {
                value: 10,
                message: "Phone number must be at least 10 characters",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                id="phone"
                type="text"
                label="Phone Number"
                required
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                // {...register("role")}
                id="role"
                {...field}
                label="Select Role"
                required
                error={errors.role?.message}
                options={[
                  { label: "CONTRACTOR", value: "WORKER" },
                  { label: "EMPLOYEE", value: "EMPLOYEE" },
                ]}
              />
            )}
          />
        </div>
        <div className="flex gap-2">
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
        </div>

        <div className="flex h-full w-full flex-row gap-5">
          <Button
            title="Back"
            variant="secondary"
            onClick={() => router.push("/auth/login")}
          />
          <Button
            title="Next"
            onClick={handleSubmit(onSubmit)}
            icon={<IconChevronRight />}
          />
        </div>

        {/* <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" /> */}
      </form>

      <div className="">
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
