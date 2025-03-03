"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

const inputs = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

type InputType = z.infer<typeof inputs>;

export default function Login() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<InputType>({
        resolver: zodResolver(inputs)
    })

    const onSubmit = async (data: InputType) => {
        toast.loading("Logging in...")
        const response = await signIn("credentials", { ...data, redirect: false })
        if (response?.status === 200) {
            toast.dismiss()
            toast.success("Successfully Logged in!")
            router.push("/")
        } else {
            toast.dismiss()
            toast.error("Invalid Credentials")
        }
    }

    return (
        <div className="absolute font-geist container sm:w-[450px] w-full dark:text-white text-white rounded-2xl sm:m-0 p-4 md:p-8 border dark:border-green-800 border-green-200 dark:bg-white/30 bg-white/30 backdrop-blur-xl font-geist">
            <p className="font-nulshock sm:text-xl text-lg">WELCOME TO</p>
            <p className="font-nulshock w-full text-justify sm:text-xl text-xl">Tri-Services & SPD CYBER</p>
            <p className="font-nulshock mt-1 w-full text-justify text-3xl tracking-wide text-[#31FD84]">ATTACK & DEFENSE</p>
            <p className="text-xs max-w-sm mt-2 text-center">
                Login to your account.
            </p>
            <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email" className="dark:text-white text-white">Email Address</Label>
                    <Input
                        title="email"
                        aria-label="email"
                        id="email"
                        type="email"
                        className=" dark:bg-neutral-800 bg-neutral-200"
                        {...register('email', { required: true })}
                    />
                    {errors.email && <p className="text-red-600 text-xs italic">{errors.email.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password" className="dark:text-white text-white">Password</Label>
                    <Input
                        title="password"
                        aria-label="password"
                        id="password"
                        type="password"
                        className=" dark:bg-neutral-800 bg-neutral-200"
                        {...register('password', { required: true })}
                    />
                    {errors.password && <p className="text-red-600 text-xs italic">{errors.password.message}</p>}
                    <div className="w-full text-right mb-4">
                        <Link href="/auth/resetPassword" className=" underline text-xs">
                            Forgot Password?
                        </Link>
                    </div>
                </LabelInputContainer>
                <button
                    className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full  rounded-md h-10 font-medium border border-zinc-200 bg-transparent shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                    type="submit"
                >
                    Login &rarr;
                    <BottomGradient />
                </button>

                <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            </form>

            <div className="flex flex-col space-y-2 mt-10">
                <p className="text-center text-sm ">{`Don't have an account? Sign up!`}&nbsp;</p>
                <Link
                    href="/"
                    className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium border border-zinc-200 bg-transparent shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                    type="button"
                >
                    <span className=" dark:text-white text-white text-sm">
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
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
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
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};
