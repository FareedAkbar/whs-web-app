import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "@/env";
import { z } from "zod";
import { ReportResponse, severity } from "@/types/report";

const dynamicQuestionSchema = z.array(
  z.object({
    questionId: z.string(),
    answer: z.string(),
  }),
);


const incidentCreateSchema = z.object({
  reportTitle: z.string(),
  coordinates: z.string().optional(),
  address: z.string().optional(),
  reportDescription: z.string(),
  severity: z.enum(Object.keys(severity) as [keyof typeof severity]),
  mainType: z.literal("INCIDENT"),
  status: z.string(),
  followUp: z.boolean().optional(),
  categoryType: z.string(),
  incidentDescription: z.string(),
  treatmentType: z.string(),
  treatmentDescription: z.string(),
  injuredBodyPart: z.string(),
  firstAiderName: z.string().optional(),
  firstAiderPhone: z.string().optional(),
  firstAiderEmail: z.string().optional(),
  firstAidDate: z.string().optional(),
  injuredPersonName: z.string(),
  injuredPhoneNumber: z.string(),
  injuredPersonEmail: z.string(),
  managerSignatureConfirmationDate: z.string().nullable(),
  dynamicQuestion: dynamicQuestionSchema.optional(),
  media: z.array(z.string()),
});

const hazardCreateSchema = z.object({
  reportTitle: z.string(),
  coordinates: z.string().optional(),
  address: z.string().optional(),
  reportDescription: z.string().optional(),
  severity: z.enum(Object.keys(severity) as [keyof typeof severity]),
  mainType: z.literal("HAZARD"),
  status: z.string(),
  categoryType: z.string(),
  action: z.string().optional(),
  actionDescription: z.string().optional(),
  hazardDescription: z.string().optional(),
  managerSignatureConfirmationDate: z.string().nullable(),
  dynamicQuestion: dynamicQuestionSchema.optional(),
  media: z.array(z.string()),
});

export const incidentRouter = createTRPCRouter({
  getIncidents: publicProcedure.query(async ({ ctx }) => {
    try {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }
      console.log("token", userToken);
      
      const response = await fetch(`${env.BASE_URL}/incident?type=INCIDENT`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

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
  getReportById: publicProcedure
    .input(
      z.object({
        reportId: z.string(),
        type: z.enum(["INCIDENT", "HAZARD"]),
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
          `${env.BASE_URL}/incident?id=${input.reportId}&type=${input.type}`,
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
        incident: incidentCreateSchema,
        hazard: hazardCreateSchema.optional(),
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
console.log("input icnident",input);

        const response = await fetch(`${env.BASE_URL}/incident`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

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
        hazard: hazardCreateSchema,
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
        incidentId: z.string().optional(),
        status: z.string(),
        comments: z.string().optional(),
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
        const response = await fetch(`${env.BASE_URL}/incident/status`, {
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
