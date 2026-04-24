import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@/lib/clerk";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${env.BASE_URL}/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("Login error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const userData = (await response.json()) as LoginResponseData;
        return {
          status: true,
          user: userData.user,
          token: userData.token,
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while logging in.",
        };
      }
    }),

  socialLogin: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        providerImageUrl: z.string(),
        authType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${env.BASE_URL}/user/social`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("Login error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const userData = (await response.json()) as LoginResponseData;
        return {
          status: true,
          user: userData.user,
          token: userData.token,
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          status: false,
          error: "An error occurred while logging in.",
        };
      }
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(`${env.BASE_URL}/user/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("Login error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const userData = (await response.json()) as LoginResponseData;
        return {
          status: true,
          user: userData.user,
          token: userData.token,
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          status: false,
          error: "An error occurred while logging in.",
        };
      }
    }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        phoneNumber: z.string(),
        role: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log(input);
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [input.email],
          password: input.password,
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" ") || "",
          publicMetadata: {
            role: input.role,
          },
        });
      } catch (err: any) {
        // Clerk ka error handle karo (e.g. email already exists)
        console.error("Clerk error:", err);
        console.log("Clerk full error:", JSON.stringify(err, null, 2));
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.errors?.[0]?.message ?? "Failed to create Clerk user",
        });
      }
      try {
        const user = {
          name: input.name,
          email: input.email,
          password: input.password,
          phoneNumber: input.phoneNumber,
          role: input.role,
        };

        const response = await fetch(`${env.BASE_URL}/user/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        console.log(response);
        if (!response.ok) {
          const error = (await response.json()) as { error: string };
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.error,
          });
        }
        const userData = (await response.json()) as unknown;

        console.log(userData);

        return {
          status: true,
        };
      } catch (error: unknown) {
        console.error("Network error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }),

  updatePassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //
      console.log(ctx, input);
      return true;
    }),

  createPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        code: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const user = {
          email: input.email,
          password: input.password,
          code: input.code,
        };

        const response = await fetch(`${env.BASE_URL}/user/create-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });
        console.log(response);
        if (!response.ok) {
          const error = (await response.json()) as { error: string };
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.error,
          });
        }
        const userData = (await response.json()) as unknown;

        console.log(userData);

        return {
          status: true,
        };
      } catch (error: unknown) {
        console.error("Network error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    }),
});
