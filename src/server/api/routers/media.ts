import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "@/env";
import type {
  FileUrl,
  GetMediaResponse,
  UploadMediaApiResponse,
} from "@/types/media";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediaRouter = createTRPCRouter({
  getMedia: publicProcedure.query(async ({ ctx }) => {
    const userToken = ctx.session?.user.token;
    if (!userToken) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
    }

    const response = await fetch(`${env.BASE_URL}/media`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    const payload = (await response.json()) as
      | GetMediaResponse
      | {
          message?: string;
        };

    if (!response.ok) {
      return {
        status: false,
        data: [],
        error: payload.message ?? "Failed to load media",
      };
    }

    return {
      status: true,
      data: "data" in payload ? payload.data : [],
    };
  }),

  uploadMedia: publicProcedure
    .input(
      z.object({
        files: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              dataUrl: z.string(),
            }),
          )
          .min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const formData = new FormData();

      for (const file of input.files) {
        const blob = await fetch(file.dataUrl).then((response) =>
          response.blob(),
        );
        formData.append("files", blob, file.name);
      }

      const response = await fetch(`${env.BASE_URL}/media`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      const text = await response.text();
      let payload: UploadMediaApiResponse | { message?: string } = {};

      if (text.trim().startsWith("{")) {
        payload = JSON.parse(text) as UploadMediaApiResponse;
      }

      if (!response.ok) {
        return {
          status: false,
          data: [] as FileUrl[],
          error:
            response.status === 413
              ? "Upload failed because the selected image is too large."
              : (payload.message ?? "Failed to upload media"),
        };
      }

      if (!("fileUrls" in payload) || !payload.fileUrls?.length) {
        return {
          status: false,
          data: [] as FileUrl[],
          error: payload.message ?? "Upload failed",
        };
      }

      return {
        status: true,
        data: payload.fileUrls,
      };
    }),

  deleteMedia: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userToken = ctx.session?.user.token;
      if (!userToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      const response = await fetch(`${env.BASE_URL}/media?id=${input.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      });

      const payload = (await response.json()) as
        | GetMediaResponse
        | {
            message?: string;
          };
console.log("response", response);
console.log("payload", payload);

      if (!response.ok) {
        return {
          status: false,
          data: [],
          error: payload.message ?? "Failed to delete media",
        };
      }

      return {
        status: true,
        data: "data" in payload ? payload.data : [],
      };
    }),
});
