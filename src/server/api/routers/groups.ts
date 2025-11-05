import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { UsersResponseData } from "@/types/user";

export const groupRouter = createTRPCRouter({
  getGroupData: publicProcedure
    .input(
      z.object({
        groupType: z.enum(["DEPARTMENT", "PC_TEAM", "FACILITY"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(
          `${env.BASE_URL}/group/all?groupType=${input.groupType}`,
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
          console.error("departments getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const departmentsData = (await response.json()) as GroupApiResponse;
        return {
          status: true,
          data: departmentsData.data,
        };
      } catch (error) {
        console.error("Groups error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching departments.",
        };
      }
    }),
  createGroup: publicProcedure
    .input(
      z.object({
        groupType: z.enum(["DEPARTMENT", "PC_TEAM", "FACILITY"]),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
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
        const response = await fetch(`${env.BASE_URL}/group/create`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: input.name,
            description: input.description,
            groupType: input.groupType,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("departments getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const departmentsData = (await response.json()) as CreateGroupResponse;
        return {
          status: true,
          data: departmentsData.data,
        };
      } catch (error) {
        console.error("Groups error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching departments.",
        };
      }
    }),
  getUnAssignedUsers: publicProcedure
    .input(
      z.object({
        role: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(
          `${env.BASE_URL}/admin/un-assigned-users?role=${input.role}`,
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
          console.error("unassigned users getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const unAssignedUsersData =
          (await response.json()) as UsersResponseData;
        return {
          status: true,
          data: unAssignedUsersData.users,
        };
      } catch (error) {
        console.error("Unassigned Users error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching unassigned users.",
        };
      }
    }),
  addUserToGroup: publicProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        groupId: z.string(),
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
        const response = await fetch(`${env.BASE_URL}/group/add-user`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("departments getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const departmentsData = (await response.json()) as GroupApiResponse;
        return {
          status: true,
          data: departmentsData.data,
        };
      } catch (error) {
        console.error("Groups error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching departments.",
        };
      }
    }),
});
