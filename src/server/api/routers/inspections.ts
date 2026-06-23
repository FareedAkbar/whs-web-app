import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import z from "zod";

export const InspectionRouter = createTRPCRouter({
  getInspections: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      console.log("token", userToken);

      const response = await fetch(`${env.BASE_URL}/inspection`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

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

  getInspectionById: publicProcedure
    .input(
      z.object({
        id: z.string(),
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

        console.log("token inspection id", userToken);

        const response = await fetch(
          `${env.BASE_URL}/inspection/inspection-survey`,
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: input.id }),
          },
        );

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("inspections getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const inspectionsData =
          (await response.json()) as getInspectionResponse;
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
        status: z.string().optional(),
        sections: z.array(
          z.object({
            title: z.string().min(1, "Section title is required"),
            description: z.string().optional(),
            order: z.number(),
            notes: z.string().optional(),
            questions: z.array(
              z.object({
                questionNumber: z.number(),
                title: z.string().min(1, "Question title is required"),
                type: z.string(),
                options: z.array(z.string()).optional(),
              }),
            ),
            tables: z.array(                    // ← new
      z.object({
        name: z.string().min(1),
        columns: z.array(z.string().min(1)),
      }),
    ).optional(),

          }),
        ),
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
        console.log("token", userToken);

        const response = await fetch(`${env.BASE_URL}/inspection/create`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        const responseData = (await response.json()) as {
          data?: Inspection[];
          message?: string;
          status?: string;
        };

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
        };
      } catch (error) {
        console.error("Error assigning inspections:", error);
        return {
          status: false,
          error: "Failed to assign inspections",
        };
      }
    }),

  submitInspection: publicProcedure
    .input(
      z.object({
        inspectionId: z.string(),
      areaBuilding: z.string().min(1, "Area Building is required"),
      areaDescription: z.string().min(1, "Area description is required"),
      businessUnit: z.string().optional().default(""),
      inspectionBuddy: z.string().optional().default(""),
      nextInspectionDue: z.string().optional().default(""),
      comments: z.string().optional().default(""),
        // ── Sections ──
        sections: z.array(
          // inside sections z.array(...)
          z.object({
            sectionId: z.string(),
            hazardId: z.array(z.string()),          // ← replaces hazardId + additionalHazards
            hazard: z.array(z.any()),               // ← replaces hazard + additionalHazards
            answers: z.array(
              z.object({
                questionId: z.string(),
                answer: z.any(),
              }),
            ),
            comments: z.string().optional(),
            tables: z.array(
              z.object({
                tableId: z.string(),
                rows: z.array(z.record(z.string(), z.string())),
              }),
            ).optional(),
          })
        ),
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

        const response = await fetch(`${env.BASE_URL}/inspection/submit`, {
          method: "PUT",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inspectionId: input.inspectionId,
            areaBuilding: input.areaBuilding,
            areaDescription: input.areaDescription,
            businessUnit: input.businessUnit,
            inspectionBuddy: input.inspectionBuddy,
            nextInspectionDue: input.nextInspectionDue,
            comments: input.comments,
            sections: input.sections,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          return {
            status: false,
            error:
              (responseData as { message?: string }).message ??
              "Something went wrong",
          };
        }

        return {
          status: true,
          message: "Inspection submitted successfully",
        };
      } catch (error) {
        console.error("Submit inspection error:", error);
        return {
          status: false,
          error: "Failed to submit inspection",
        };
      }
    }),
   sendReminder: publicProcedure
  .input(
    z.object({
      users: z.array(
        z.object({
          name: z.string(),
          email: z.string().email(),
          expiry_date: z.string(),
        }),
      ),
      title: z.string(),
      message: z.string(),
      email_title: z.string(),
      subject: z.string(),
      subtitle: z.string().optional().default(""),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }
      const response = await fetch(`${env.BASE_URL}/inspection/send-reminder`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const responseData = (await response.json()) as { message?: string };
      if (!response.ok) {
        return { status: false, error: responseData.message ?? "Failed to send reminder" };
      }
      return { status: true };
    } catch (error) {
      console.error("Send reminder error:", error);
      return { status: false, error: "Failed to send reminder" };
    }
  }),
});