import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import { z } from "zod";
import { ReportResponse } from "@/types/report";

export const reportRouter = createTRPCRouter({
 // addComment — add showToAll to input
addComment: publicProcedure
  .input(
    z.object({
      reportId: z.string(),
      comments: z.string(),
      showToAll: z.boolean().default(false),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });

      const response = await fetch(`${env.BASE_URL}/incident/add-comments`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: input.reportId,
          comments: input.comments,
          showToAll: input.showToAll,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        return { status: false, error: errorData.message };
      }

      const data = (await response.json()) as { message: string; status: string };
      return { status: true, message: data.message };
    } catch (error) {
      return {
        status: false,
        error: error instanceof Error ? error.message : "An error occurred while adding comments.",
      };
    }
  }),

// updateComment — toggle showToAll on an existing comment
updateComment: publicProcedure
  .input(
    z.object({
      reportId: z.string(),
      commentId: z.string(),
      showToAll: z.boolean(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });

      const response = await fetch(`${env.BASE_URL}/incident/update-comments`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: input.reportId,
          commentId: input.commentId,
          showToAll: input.showToAll,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        return { status: false, error: errorData.message };
      }

      const data = (await response.json()) as { message: string };
      return { status: true, message: data.message };
    } catch (error) {
      return {
        status: false,
        error: error instanceof Error ? error.message : "An error occurred while updating comment.",
      };
    }
  }),
  updateReportStatus: publicProcedure
    .input(
      z.object({
        incidentReportId: z.string(),
        status: z.string(),
        comments: z.string().optional(),
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
        const response = await fetch(`${env.BASE_URL}/incident/status-report`, {
          method: "PUT",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("incident assign error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }
        const incidentsData = (await response.json()) as {
          status: string;
          message: string;
          data: ReportResponse;
        };
        return {
          status: true,
          data: incidentsData.data,
        };
      } catch (error) {
        console.error("Incident error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while logging in.",
        };
      }
    }),
  //make upper query a muattion
});
