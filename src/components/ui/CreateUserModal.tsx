"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal"; // <-- adjust this import to your modal component path
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify"; // or your toast lib
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Select } from "./Select";
import { api } from "@/trpc/react";
import { userRoles } from "@/types/roles";

// Validation schema (same as TRPC mutation)
const createUserSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .nonempty("Phone number is required")
    .regex(/^[0-9]+$/, "Enter a valid phone number"),
  role: z.string().nonempty("User type is required"),
  isVerified: z.boolean().default(true),
  isVerifiedByAdmin: z.boolean().default(true),
  onboardingCompleted: z.boolean().default(false),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  onClose: () => void;
}

export default function CreateUserModal({ onClose }: CreateUserModalProps) {
  const methods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "",
      isVerified: true,
      isVerifiedByAdmin: true,
      onboardingCompleted: true,
    },
  });
  const createUser = api.users.createUser.useMutation();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  const onSubmitCreateUser = async (data: CreateUserInput) => {
    try {
      createUser.mutate(data, {
        onSuccess: () => {
          toast.success("User created successfully!");
          reset();
          onClose();
        },
        onError: (error) => {
          console.error("Error creating user:", error);
          toast.error("Something went wrong.");
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <Modal>
      <ModalContent className="max-w-lg rounded-2xl bg-white shadow-lg dark:bg-gray-950">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Create User
        </h2>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitCreateUser)}>
            <ModalBody>
              <div className="flex flex-col space-y-4">
                {/* Name Field */}

                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      label="Full Name"
                      required
                      error={errors.name?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter email address"
                      {...field}
                      label="Email"
                      required
                      error={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      label="Phone Number"
                      required
                      error={errors.phoneNumber?.message}
                    />
                  )}
                />

                {/* Role Select */}

                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      id="role"
                      {...field}
                      label="Select Role"
                      required
                      error={errors.role?.message}
                      options={Array.from(Object.values(userRoles)).map(
                        (role) => ({
                          value: role,
                          label: role.replaceAll("_", " "),
                        }),
                      )}
                    />
                  )}
                />
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-end gap-3 border-t pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                title="Cancel"
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                title="Create User"
              />
            </ModalFooter>
          </form>
        </FormProvider>
      </ModalContent>
    </Modal>
  );
}
