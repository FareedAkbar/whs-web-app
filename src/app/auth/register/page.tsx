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
import { api } from "@/trpc/react";

const inputs = z.object({
    fName: z.string().min(4),
    lName: z.string().min(4),
    username: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
});

type InputType = z.infer<typeof inputs>;

export default function Register() {
    const router = useRouter()
    const registerUser = api.auth.register.useMutation()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<InputType>({
        resolver: zodResolver(inputs)
    })

    const onSubmit = async (data: InputType) => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        toast.loading("Creating account...");
        await registerUser.mutateAsync({
            username: data.username,
            fName: data.fName,
            lName: data.lName,
            email: data.email,
            password: data.password
        }, {
            onSuccess: (data) => {
                toast.dismiss();
                toast.success("Account created successfully");
                router.push(`/auth/login`);
            },
            onError: (error) => {
                toast.dismiss();
                console.error("Failed to create account:", error);
                toast.error(error.message ?? "Something went wrong");
            },
        });
    };

    return (
        <div className="absolute font-geist container sm:w-[450px] w-full dark:text-black text-black rounded-2xl sm:m-0 p-4 md:p-8 shadow-2xl dark:bg-white/30 bg-white/30 backdrop-blur-xl font-geist">
            <div className="flex font-nulshock text-3xl justify-center items-center">
                <span className="text-black">WHS</span>
                <span className="text-red-700">APP</span>
            </div>
            <p className="text-xs max-w-sm mt-2 text-center">
                Register New account.
            </p>
            <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex gap-2">
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="fName" className="dark:text-black text-black">First Name</Label>
                        <Input
                            title="fName"
                            aria-label="fName"
                            id="fName"
                            type="text"
                            className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                            {...register('fName', { required: true })}
                        />
                        {errors.fName && <p className="text-red-600 text-xs italic">{errors.fName.message}</p>}
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="lName" className="dark:text-black text-black">Last Name</Label>
                        <Input
                            title="lName"
                            aria-label="lName"
                            id="lName"
                            type="text"
                            className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                            {...register('lName', { required: true })}
                        />
                        {errors.lName && <p className="text-red-600 text-xs italic">{errors.lName.message}</p>}
                    </LabelInputContainer>
                </div>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="username" className="dark:text-black text-black">Username</Label>
                    <Input
                        title="username"
                        aria-label="username"
                        id="username"
                        type="text"
                        className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                        {...register('username', { required: true })}
                    />
                    {errors.username && <p className="text-red-600 text-xs italic">{errors.username.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email" className="dark:text-black text-black">Email Address</Label>
                    <Input
                        title="email"
                        aria-label="email"
                        id="email"
                        type="email"
                        className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                        {...register('email', { required: true })}
                    />
                    {errors.email && <p className="text-red-600 text-xs italic">{errors.email.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password" className="dark:text-black text-black">Password</Label>
                    <Input
                        title="password"
                        aria-label="password"
                        id="password"
                        type="password"
                        className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                        {...register('password', { required: true })}
                    />
                    {errors.password && <p className="text-red-600 text-xs italic">{errors.password.message}</p>}
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="confirmPassword" className="dark:text-black text-black">Confirm Password</Label>
                    <Input
                        title="confirmPassword"
                        aria-label="confirmPassword"
                        id="confirmPassword"
                        type="password"
                        className=" dark:bg-neutral-200/20 bg-neutral-200/20 backdrop-blur-lg text-black dark:text-black"
                        {...register('confirmPassword', { required: true })}
                    />
                    {errors.confirmPassword && <p className="text-red-600 text-xs italic">{errors.confirmPassword.message}</p>}
                </LabelInputContainer>
                <div className="w-full h-full flex flex-col gap-2">
                    <button
                        className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full  rounded-md h-10 font-medium border border-zinc-200 bg-transparent shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                        type="submit"
                    >
                        Register &rarr;
                        <BottomGradient />
                    </button>
                </div>
                <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

            </form>

            <div className="flex flex-col space-y-2 mt-10">
                <p className="text-center text-sm ">{`Already have an account? Log in!`}&nbsp;</p>
                <Link
                    href="/auth/login"
                    className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium border border-zinc-200 bg-transparent shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                    type="button"
                >
                    <span className=" dark:text-black text-black text-sm">
                        Login &rarr;
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
