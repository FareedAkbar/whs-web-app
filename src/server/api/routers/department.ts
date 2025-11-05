import { env } from "@/env";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { group } from "console";
import { UsersResponseData } from "@/types/user";

export const departmentRouter = createTRPCRouter({
  getDepartments: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(
        `${env.BASE_URL}/group/all?groupType=DEPARTMENT`,
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
  getDepartmentById: publicProcedure
    .input(
      z.object({
        departmentId: z.string(),
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
          `${env.BASE_URL}/department?id=${input.departmentId}`,
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
        console.error("Departments error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching departments.",
        };
      }
    }),
  createDepartment: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        // groupType: z.string().optional(),
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
            groupType: "DEPARTMENT", // Assuming groupType is always "DEPARTMENT"
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
        console.error("Departments error:", error);
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
  addUserToDepartment: publicProcedure
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
