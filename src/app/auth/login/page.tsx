"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn, useSession } from "next-auth/react";
import { IconBrandGoogle } from "@tabler/icons-react";
import { api } from "@/trpc/react";
import Button from "@/components/ui/Button";

const inputs = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type InputType = z.infer<typeof inputs>;

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(inputs),
  });
  const loginUser = api.auth.login.useMutation();
  const loginWithGoogle = api.auth.socialLogin.useMutation();
  const onSubmit = async (data: InputType) => {
    toast.loading("Logging in...");

    try {
      // Attempt NextAuth sign-in first
      const response = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (response?.status === 200) {
        // Optional: Log backend login
        const resp = await loginUser.mutateAsync(data);
        console.log("resp", resp);
        if (resp.status) {
          localStorage.setItem("user", JSON.stringify(resp.user));
        }
        // localStorage.setItem("user", JSON.stringify(resp.user));
        toast.dismiss();
        toast.success("Successfully Logged in!");
        router.push("/dashboard");
      } else {
        toast.dismiss();
        toast.error("Invalid Credentials");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message ?? "Something went wrong");
    }
  };

  async function handleLoginClick() {
    toast
      .promise(
        signIn("google", { callbackUrl: "http://localhost:3000/dashboard" }),
        {
          pending: "Logging in with Google...",
          success: "Successfully Logged in with Google!",
          error: "Failed to Login with Google",
        },
      )
      .catch(() => {
        toast.error("Failed to Login with Google");
      });
  }

  return (
    <div className="font-geist container w-full rounded-2xl bg-white p-4 text-black shadow-2xl backdrop-blur-xl sm:m-0 sm:w-[450px] md:p-8 dark:bg-white/30 dark:text-black">
      <div className="flex text-3xl">
        <span className="font-bold text-primary">Welcome Back</span>
      </div>
      <p className="mt-2 max-w-sm text-xs text-gray-500">
        Enter your email and password to sign in
      </p>
      <form className="mt-5" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              required
              label="Email Address"
              className="bg-neutral-200/20 text-black backdrop-blur-lg dark:bg-neutral-200/20 dark:text-black"
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="password"
              type="password"
              required
              label="Password"
              className="bg-neutral-200/20 text-black backdrop-blur-lg dark:bg-neutral-200/20 dark:text-black"
            />
          )}
        />
        <div className="mb-4 w-full text-right text-primary">
          <Link href="/auth/forgot-password" className="text-xs underline">
            Forgot Password?
          </Link>
        </div>

        <div className="flex h-full w-full flex-col gap-2">
          <Button title="Sign in" onClick={handleSubmit(onSubmit)} />
          <div className="pt-3">
            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary underline">
                Sign up
              </Link>{" "}
            </p>
          </div>
          <p className="text-center text-gray-500">OR</p>
          {/* <button
            className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-zinc-200 bg-transparent px-4 font-medium shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="submit"
          >
            Login &rarr;
            <BottomGradient />
          </button> */}
          <div className="flex w-full flex-wrap items-center justify-center gap-4">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleLoginClick()}
              className="group relative flex h-12 items-center gap-3 rounded-md bg-[#EC1C2910] px-6 shadow-[0_0_1px_1px_var(--neutral-800)] transition hover:scale-105"
            >
              <img src="/images/google.png" alt="Google" className="h-6 w-6" />
              <span className="whitespace-nowrap text-sm font-medium text-neutral-800">
                Sign in with Google
              </span>
              <BottomGradient />
            </button>

            {/* Facebook Button - Icon only */}
            <button
              type="button"
              // onClick={() => handleLoginClick("facebook")}
              className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 shadow-[0_0_1px_1px_var(--neutral-800)] transition hover:scale-110"
            >
              <img
                src="/images/facebook.png"
                alt="Facebook"
                className="h-6 w-6"
              />
              <BottomGradient />
            </button>

            {/* Apple Button - Icon only */}
            <button
              type="button"
              // onClick={() => handleLoginClick("apple")}
              className="group relative flex h-12 w-12 items-center justify-center rounded-md bg-zinc-100 shadow-[0_0_1px_1px_var(--neutral-800)] transition hover:scale-110"
            >
              <img src="/images/apple.png" alt="Apple" className="h-6 w-6" />
              <BottomGradient />
            </button>
          </div>
        </div>
        {/* <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" /> */}
      </form>

      {/* <div className="mt-10 flex flex-col space-y-2">
        <Link
          href="/"
          className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-zinc-200 bg-transparent px-4 font-medium text-black shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          type="button"
        >
          <span className="text-sm text-black dark:text-black">
            Go to Homepage
          </span>
          <BottomGradient />
        </Link>
      </div> */}
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
