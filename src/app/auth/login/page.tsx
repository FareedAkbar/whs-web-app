"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { IconBrandGoogle } from "@tabler/icons-react";

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
    formState: { errors },
  } = useForm<InputType>({
    resolver: zodResolver(inputs),
  });

  const onSubmit = async (data: InputType) => {
    toast.loading("Logging in...");
    const response = await signIn("credentials", { ...data, redirect: false });
    if (response?.status === 200) {
      console.log("resppp", response);

      toast.dismiss();
      toast.success("Successfully Logged in!");
      router.push("/dashboard");
    } else {
      toast.dismiss();
      toast.error("Invalid Credentials");
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
    <div className="font-geist font-geist container absolute w-full rounded-2xl bg-white/30 p-4 text-black shadow-2xl backdrop-blur-xl sm:m-0 sm:w-[450px] md:p-8 dark:bg-white/30 dark:text-black">
      <div className="font-nulshock flex items-center justify-center text-3xl">
        <span className="text-black">WHS</span>
        <span className="text-red-700">APP</span>
      </div>
      <p className="mt-2 max-w-sm text-center text-xs">
        Login to your account.
      </p>
      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="text-black dark:text-black">
            Email Address
          </Label>
          <Input
            title="email"
            aria-label="email"
            id="email"
            type="email"
            className="bg-neutral-200/20 text-black backdrop-blur-lg dark:bg-neutral-200/20 dark:text-black"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <p className="text-xs italic text-red-600">
              {errors.email.message}
            </p>
          )}
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password" className="text-black dark:text-black">
            Password
          </Label>
          <Input
            title="password"
            aria-label="password"
            id="password"
            type="password"
            className="bg-neutral-200/20 text-black backdrop-blur-lg dark:bg-neutral-200/20 dark:text-black"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <p className="text-xs italic text-red-600">
              {errors.password.message}
            </p>
          )}
          <div className="mb-4 w-full text-right">
            <Link href="/auth/resetPassword" className="text-xs underline">
              Forgot Password?
            </Link>
          </div>
        </LabelInputContainer>
        <div className="flex h-full w-full flex-col gap-2">
          <button
            className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-zinc-200 bg-transparent px-4 font-medium shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="submit"
          >
            Login &rarr;
            <BottomGradient />
          </button>
          <button
            className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-zinc-200 bg-transparent px-4 font-medium shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="button"
            onClick={handleLoginClick}
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800" />
            <span className="text-sm text-neutral-800">
              Continue with Google
            </span>
            <BottomGradient />
          </button>
        </div>
        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
      </form>

      <div className="mt-10 flex flex-col space-y-2">
        <p className="text-center text-sm">
          {`Don't have an account? Sign up!`}&nbsp;
        </p>
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
      </div>
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
