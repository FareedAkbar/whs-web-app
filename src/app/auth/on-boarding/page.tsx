"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import { Select } from "@/components/ui/Select";
import { Controller, useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { userRoles } from "@/types/roles";

type FormValues = {
  role: string;
};

export default function Onboarding() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  //   const { data, isLoading, refetch } = api.users.getUser.useQuery();
  const { data: session, update } = useSession();
  const user = session?.user;
  const updateUserProfile = api.users.updateUser.useMutation();
  const [loading, setLoading] = useState(false);
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    if (!values.role) {
      toast.error("Please select a user type.");
      return;
    }
    if (!session?.user) {
      toast.error("Session not ready, please wait...");
      return;
    }
    try {
      await updateUserProfile.mutateAsync(
        {
          id: session?.user.id,
          role: values.role,
          isVerifiedByAdmin: false,
        },
        {
          async onSuccess() {
            toast.dismiss();
            toast.success("User role updated successfully");
            await update({ role: values.role });
            router.push("/dashboard");
          },
          onError: (error: unknown) => {
            toast.dismiss();
            console.error("Failed to update user role:", error);

            if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Something went wrong");
            }
          },
        },
      );
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update user role");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-geist container w-full rounded-2xl bg-white/80 p-4 text-black shadow-2xl backdrop-blur-xl dark:bg-gray-950/60 dark:text-white sm:m-0 sm:w-[450px] md:p-8">
      {/* Image */}
      <Image
        src="/images/welcome.png"
        alt="Welcome"
        width={1000}
        height={1000}
        className="mx-auto h-auto w-56"
        priority
      />

      {/* Welcome Message */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Welcome to WHS App!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
          Ensure a safer workplace by quickly reporting hazards and incidents.
          Select your role to get started and contribute to a secure environment
          for everyone.
        </p>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        <div className="mt-2 flex items-center gap-2 text-sm">
          <label className="text-gray-500 dark:text-gray-300">Name:</label>
          <p className="text-sm">{user?.name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-500 dark:text-gray-300">Email:</label>
          <p className="text-sm">{user?.email}</p>
        </div>

        <Controller
          name="role"
          control={control}
          rules={{ required: "Please select a role" }}
          render={({ field }) => (
            <Select
              {...field}
              id="role"
              label="Select Role"
              required
              error={errors.role?.message}
              options={Array.from(Object.values(userRoles))
                .filter((role) => role !== "UNDEFINED")
                .map((role) => ({
                  value: role,
                  label: role.replaceAll("_", " "),
                }))}
              selectedValue={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        />

        <Button
          title="Submit"
          type="submit"
          className="w-full"
          loading={loading}
        />
      </form>
    </div>
  );
}
