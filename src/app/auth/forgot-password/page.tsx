"use client";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/Button";
import { IconChevronRight } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordInput = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = () => {
    // Trigger OTP email here
    router.push("/auth/verify-otp");
  };

  return (
    <div className="container w-full rounded-2xl bg-white p-4 text-black shadow-2xl dark:bg-gray-950/60 dark:text-white sm:w-[450px] md:p-8">
      <h2 className="text-3xl font-bold text-primary">Forgot Password</h2>
      <p className="mt-2 text-sm text-gray-500">
        Enter your email to receive OTP for password reset.
      </p>

      <form className="my-6" onSubmit={handleSubmit(onSubmit)}>
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
            />
          )}
        />

        <div className="flex gap-5 pt-4">
          <Button
            title="Back"
            variant="secondary"
            onClick={() => router.push("/auth/login")}
          />
          <Button
            title="Next"
            icon={<IconChevronRight size={12} />}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
