import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import z from "zod";

export const InspectionRouter = createTRPCRouter({
  getInsepctions: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/inspection`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("inspections getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const inspectionsData = (await response.json()) as getInspectionsResponse;
      return {
        status: true,
        data: inspectionsData.data,
      };
    } catch (error) {
      console.error("Error fetching inspections:", error);
      return {
        status: false,
        error: "Failed to fetch inspections",
      };
    }
  }),
  createInspection: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        questions: z.array(
          z.object({
            questionNumber: z.number(),
            title: z.string(),
            type: z.string(), // or refine with z.enum([...]) if you have strict types
            options: z.array(z.string()).optional(),
          }),
        ),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx }) => {
      try {
        const userToken = ctx.session?.user.token;
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(`${env.BASE_URL}/inspection/create`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        });
        console.log("response", response);
        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("inspections getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const inspectionsData =
          (await response.json()) as getInspectionsResponse;
        return {
          status: true,
          data: inspectionsData.data,
        };
      } catch (error) {
        console.error("Error fetching inspections:", error);
        return {
          status: false,
          error: "Failed to fetch inspections",
        };
      }
    }),
});
