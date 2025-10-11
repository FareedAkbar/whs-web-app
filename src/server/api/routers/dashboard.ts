import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";

export const dashboardRouter = createTRPCRouter({
  getAdminCounters: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/admin/dashboard`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const enumsData = (await response.json()) as DashboardStatsApiResponse;
      console.log("enumsData", enumsData);
      return {
        status: true,
        data: enumsData.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),
  getDashboardCounters: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/admin/dashboard`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const enumsData = (await response.json()) as DashboardStatsApiResponse;
      console.log("enumsData", enumsData);
      return {
        status: true,
        data: enumsData.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),

  getWorkerCounters: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/user/worker-counts`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const counts = (await response.json()) as dashboardManagerApiResponse;
      return {
        status: true,
        data: counts.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while getting counters.",
      };
    }
  }),
  getEmployeeCounters: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/user/employee-counts`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const counts = (await response.json()) as dashboardEmployeeApiResponse;
      return {
        status: true,
        data: counts.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while getting counters.",
      };
    }
  }),
  getStaffCounters: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/user/staff-counts`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const counts = (await response.json()) as dashboardEmployeeApiResponse;
      return {
        status: true,
        data: counts.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while getting counters.",
      };
    }
  }),
  getManagerCounters: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/user/manager-counts`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("enums getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const counts = (await response.json()) as dashboardManagerApiResponse;
      return {
        status: true,
        data: counts.data,
      };
    } catch (error) {
      console.error("enum error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while getting counters.",
      };
    }
  }),
});
