import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import { z } from "zod";
import { ReportResponse } from "@/types/report";

export const incidentRouter = createTRPCRouter({
  getIncidents: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      console.log("userToken", userToken);
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/incident?type=INCIDENT`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("incidents getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const incidentsData = (await response.json()) as {
        status: string;
        message: string;
        data: ReportResponse[];
      };
      return {
        status: true,
        data: incidentsData.data,
      };
    } catch (error) {
      console.error("Incidents error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),
  getHazards: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      console.log("userToken", userToken);
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      const response = await fetch(`${env.BASE_URL}/incident?type=HAZARD`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response);
      if (!response.ok) {
        const errorData = (await response.json()) as { message: string };
        console.error("incidents getting error:", errorData);
        return {
          status: false,
          error: errorData.message,
        };
      }

      const incidentsData = (await response.json()) as {
        status: string;
        message: string;
        data: ReportResponse[];
      };
      return {
        status: true,
        data: incidentsData.data,
      };
    } catch (error) {
      console.error("Incidents error:", error);
      return {
        status: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while logging in.",
      };
    }
  }),
  assignIncident: publicProcedure
    .input(
      z.object({
        reportId: z.string(),
        incidentId: z.string().optional(),
        assignedTo: z.string(),
        hazardId: z.string().optional(),
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
        const response = await fetch(`${env.BASE_URL}/incident/assign`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });
        console.log("response", response);
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
  getIncidentById: publicProcedure
    .input(
      z.object({
        incidentReportId: z.string(),
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
          `${env.BASE_URL}/incident?id=${input.incidentReportId}&type=INCIDENT`,
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
          console.error("incident getting error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }
        const incidentData = (await response.json()) as {
          status: string;
          message: string;
          data: ReportResponse;
        };
        return {
          status: true,
          data: incidentData.data,
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
  reportIncident: publicProcedure
    .input(
      z.object({
        // Report Data
        reportTitle: z.string(),
        coordinates: z.string(),
        reportDescription: z.string(),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "EXTREME"]),
        mainType: z.literal("INCIDENT"),
        status: z.string(),
        followUp: z.boolean(),

        // Incident Data
        categoryType: z.string(),
        incidentDescription: z.string(),
        treatmentType: z.string(),
        treatmentDescription: z.string(),
        injuredBodyPart: z.string(),

        // First Aider Details (optional)
        firstAiderName: z.string().optional(),
        firstAiderPhone: z.string().optional(),
        firstAiderEmail: z.string().optional(),
        firstAidDate: z.string().optional(),

        // Injured Person Data
        injuredPersonName: z.string(),
        injuredPhoneNumber: z.string(),
        injuredPersonEmail: z.string(),
        managerSignatureConfirmationDate: z.string().nullable(),
        dynamicQuestion: z.array(
          z.object({
            questionId: z.string(),
            answer: z.string(),
          }),
        ),
        media: z.array(z.string()),
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

        const response = await fetch(`${env.BASE_URL}/incident`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        console.log("Incident API Response:", response);

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("Incident report error:", errorData);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: errorData.message || "Failed to report incident",
          });
        }

        const responseData = (await response.json()) as {
          status: string;
          message: string;
          data: ReportResponse;
        };
        console.log("Incident Reported Successfully:", responseData);

        return {
          status: true,
          data: responseData.data,
        };
      } catch (error) {
        console.error("Incident Report Error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while reporting the incident.",
        };
      }
    }),
  reportHazard: publicProcedure
    .input(
      z.object({
        // Report Data
        reportTitle: z.string(),
        coordinates: z.string(),
        reportDescription: z.string(),
        severity: z.enum(["LOW", "MEDIUM", "HIGH", "EXTREME"]),
        mainType: z.literal("HAZARD"),
        status: z.string(),

        // categoryType: z.string(),

        managerSignatureConfirmationDate: z.string().nullable(),
        dynamicQuestion: z.array(
          z.object({
            questionId: z.string(),
            answer: z.string(),
          }),
        ),
        media: z.array(z.string()),
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

        const response = await fetch(`${env.BASE_URL}/incident`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        console.log("Incident API Response:", response);

        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("Incident report error:", errorData);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: errorData.message || "Failed to report incident",
          });
        }

        const responseData = (await response.json()) as {
          status: string;
          message: string;
          data: ReportResponse;
        };
        console.log("Incident Reported Successfully:", responseData);

        return {
          status: true,
          data: responseData.data,
        };
      } catch (error) {
        console.error("Incident Report Error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while reporting the incident.",
        };
      }
    }),

  updateIncidentStatus: publicProcedure
    .input(
      z.object({
        incidentId: z.string(),
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
        const response = await fetch(`${env.BASE_URL}/incident/status`, {
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
  incidentAcceptance: publicProcedure
    .input(
      z.object({
        incidentReportId: z.string(),
        acceptanceStatus: z.boolean(),
        // comments:z.string().optional(),
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
        const response = await fetch(`${env.BASE_URL}/incident/accept`, {
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
  addFollowUp: publicProcedure
    .input(
      z.object({
        reportId: z.string(),
        followUpDescription: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userToken = ctx.session?.user.token;
        console.log("userToken", userToken);
        if (!userToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          });
        }
        const response = await fetch(`${env.BASE_URL}/incident/follow-ups`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportId: input.reportId,
            followUpDescription: input.followUpDescription,
          }),
        });
        console.log("add comment response", response);
        if (!response.ok) {
          const errorData = (await response.json()) as { message: string };
          console.error("adding comment error:", errorData);
          return {
            status: false,
            error: errorData.message,
          };
        }

        const incidentsData = (await response.json()) as {
          message: string;
          status: string;
        };
        return {
          status: true,
          message: incidentsData.message,
        };
      } catch (error) {
        console.error("comments error:", error);
        return {
          status: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred while adding comments.",
        };
      }
    }),
});
