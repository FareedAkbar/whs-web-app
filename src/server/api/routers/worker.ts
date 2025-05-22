import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";

export const workerRouter = createTRPCRouter({
  getWorkers: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      console.log("resppppp", `${env.BASE_URL}/admin/all-users?workers=true`);
      const response = await fetch(
        `${env.BASE_URL}/admin/all-users?workers=true`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("workers getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const workersData = (await response.json()) as UsersResponseData;
      console.log("workersData", workersData);
      return {
        status: true,
        data: workersData.users,
      };
    } catch (error) {
      console.error("worker error:", error);
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
