import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import z from "zod";
import { assign } from "nodemailer/lib/shared";

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
    .mutation(async ({ ctx, input }) => {
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
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            questions: input.questions,
            status: input.status,
          }),
        });
        const responseData = (await response.json()) as {
          data?: Inspection[];
          message?: string;
          status?: string;
        };

        console.log("response create inspection", responseData);

        if (!response.ok) {
          console.error("inspections creating error:", responseData);
          return {
            status: false,
            error:
              (responseData as { message?: string }).message ?? "Unknown error",
          };
        }

        return {
          status: true,
          data: responseData.data,
        };
      } catch (error) {
        console.error("Error creating inspections:", error);
        return {
          status: false,
          error: "Failed to create inspections",
        };
      }
    }),
  deleteInspection: publicProcedure
    .input(
      z.object({
        id: z.string(),
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
        const response = await fetch(`${env.BASE_URL}/inspection/delete`, {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: input.id }),
        });
        const responseData = (await response.json()) as {
          message?: string;
          status?: string;
        };

        console.log("response delete inspection", responseData);

        if (!response.ok) {
          console.error("inspections deleting error:", responseData);
          return {
            status: false,
            error:
              (responseData as { message?: string }).message ?? "Unknown error",
          };
        }

        return {
          status: true,
          // data: responseData?.data ? [responseData?.data] : [],
        };
      } catch (error) {
        console.error("Error deleting inspections:", error);
        return {
          status: false,
          error: "Failed to delete inspections",
        };
      }
    }),
  assignInspection: publicProcedure
    .input(
      z.object({
        surveyId: z.string(),
        assignedTo: z.string(),
        dueDate: z.string(),
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
        const response = await fetch(`${env.BASE_URL}/inspection/assign`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            surveyId: input.surveyId,
            assignedTo: input.assignedTo,
            dueDate: input.dueDate,
          }),
        });
        const responseData = (await response.json()) as {
          data?: Inspection[];
          message?: string;
          status?: string;
        };

        console.log("response assign inspection", responseData);

        if (!response.ok) {
          console.error("inspections assigning error:", responseData);
          return {
            status: false,
            error:
              (responseData as { message?: string }).message ?? "Unknown error",
          };
        }

        return {
          status: true,
          // data: (responseData as getInspectionsResponse).data,
        };
      } catch (error) {
        console.error("Error assigning inspections:", error);
        return {
          status: false,
          error: "Failed to assign inspections",
        };
      }
    }),
});
