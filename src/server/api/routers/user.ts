import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import { z } from "zod";
import {
  UpdateUserResponseData,
  UserResponseData,
  UsersResponseData,
} from "@/types/user";
import { create } from "domain";
import { clerkClient } from "@/lib/clerk";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/admin/all-users`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("users getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const usersData = (await response.json()) as UsersResponseData;
      return {
        status: true,
        data: usersData.users,
      };
    } catch (error) {
      console.error("user error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),
  getUser: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/user/refresh`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userToken}`,
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("users getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const usersData = (await response.json()) as UserResponseData;
      console.log("usersData", usersData);

      return {
        status: true,
        data: usersData.user,
      };
    } catch (error) {
      console.error("user error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string().optional(),
        isVerifiedByAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(`${env.BASE_URL}/user/update`, {
          method: "PUT",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        console.log("response", response);
        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("user update error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const usersData = (await response.json()) as UpdateUserResponseData;
        return {
          status: true,
          data: usersData.user,
        };
      } catch (error) {
        console.error("user error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while logging in.",
        };
      }
    }),
  adminUpdateUserRole: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string().optional(),
        isVerifiedByAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(`${env.BASE_URL}/admin/update-user`, {
          method: "PUT",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        console.log("response", response);
        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("user update error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const usersData = (await response.json()) as UpdateUserResponseData;
        return {
          status: true,
          data: usersData.user,
        };
      } catch (error) {
        console.error("user error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while logging in.",
        };
      }
    }),
  getVerifiedUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      const userRole = ctx.session?.user.role; // 👈 role extract

      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const response = await fetch(`${env.BASE_URL}/admin/all-verified-users`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        return {
          status: false,
          error: errorData.message,
        };
      }

      const usersData = (await response.json()) as UsersResponseData;
      return {
        status: true,
        data: usersData.users,
      };
    } catch (error) {
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while fetching verified users.",
      };
    }
  }),
  getUsersByRole: publicProcedure
    .input(z.object({ role: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const userToken = ctx.session?.user.token;

        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }

        const response = await fetch(
          `${env.BASE_URL}/user/get-user-by-role?role=${input.role}`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          return {
            status: false,
            error: errorData.message,
          };
        }

        const usersData = (await response.json()) as {
          status: string;
          message: string;
          user: User[];
        };
        console.log("usersData", usersData);

        return {
          status: true,
          data: usersData.user,
        };
      } catch (error) {
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching verified users.",
        };
      }
    }),
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phoneNumber: z.string(),
        role: z.string(),
        isVerifiedByAdmin: z.boolean().optional().default(true),
        isVerified: z.boolean().optional().default(true),
        onboardingCompleted: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";

      let clerkUser;
      try {
        clerkUser = await clerkClient.users.createUser({
          emailAddress: [input.email],
          password: tempPassword,
          firstName: input.name.split(" ")[0],
          lastName: input.name.split(" ").slice(1).join(" ") || "",
          publicMetadata: {
            role: input.role,
          },
          // Admin ne banaya toh email verify skip karo
          skipPasswordChecks: true,
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err.errors?.[0]?.longMessage ?? "Failed to create Clerk user",
        });
      }
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(`${env.BASE_URL}/user/add-user-by-admin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(input),
        });
        console.log(response);
        if (!response.ok) {
          const error = (await response.json()) as { error: string };
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.error,
          });
        }
        const userData = (await response.json()) as LoginResponseData;
        return {
          status: true,
          data: userData.user,
        };
      } catch (error) {
        console.error("user error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while logging in.",
        };
      }
    }),
});
