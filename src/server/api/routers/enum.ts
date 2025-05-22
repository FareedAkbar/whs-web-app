import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";

export const enumRouter = createTRPCRouter({
  getEnums: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/incident/enumeration`, {
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

      const enumsData = (await response.json()) as EnumerationsResponse;
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
});
