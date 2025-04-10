import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';
// import { assign } from 'nodemailer/lib/shared';
import { z } from 'zod';

export const mediaRouter = createTRPCRouter({
  //   uploadMedia: publicProcedure
  // .input(z.object({
  //   files: z.array(z.custom<File>())  // Accepts any data initially, refine based on form data later
  // }))
  // .mutation(async ({ ctx, input }) => {
  //   try {
  //     const userToken = ctx.session?.user.token;
  //     if (!userToken) {
  //       throw new TRPCError({
  //         code: 'UNAUTHORIZED',
  //         message: 'Unauthorized',
  //       });
  //     }

  //     const formData = new FormData();
  //   console.log('input', input);
  //     console.log('input.files', input.files);

  //     // Append files to FormData directly
  //     input.files.map((file: File, index) => {
  //       console.log(`Appending file ${index}:`, file);
  //       console.log(`File Name: ${file.name}`);
  //       console.log(`File Type: ${file.type}`);
  //       console.log(`File Size: ${file.size}`);

  //       formData.append('files', file); // Append files directly without validation at this point
  //     });

  //     // Debug FormData contents by inspecting each entry
  //     for (const [key, value] of formData.entries()) {
  //       if (value instanceof File) {
  //         console.log(`${key}: File Name: ${value.name}, File Type: ${value.type}, File Size: ${value.size}`);
  //       } else {
  //         console.log(`${key}:`, value);
  //       }
  //     }

  //     // Send the FormData with the request
  //     const response = await fetch(`${env.BASE_URL}/media`, {
  //       method: 'POST',
  //       headers: {
  //         authorization: `Bearer ${userToken}`,
  //       },
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const errorData:ErrorResponse= await response.json();
  //       console.error('Upload media error:', errorData);
  //       return {
  //         status: false,
  //         error: errorData.message,
  //       };
  //     }

  //     const data: UploadMediaApiResponse = await response.json();
  //     return {
  //       status: true,
  //       data: data.fileUrls,
  //     };
  //   } catch (error) {
  //     console.error('Incident error:', error);
  //     return {
  //       status: false,
  //       error: error instanceof Error ? error.message : 'An error occurred while uploading.',
  //     };
  //   }
  // }),

      
  
    // getMedia: publicProcedure
    // .input(z.object({
    //     incidentReportId: z.string(),
    // }))
    // .query(async ({ ctx, input }) => {
    //     try {
    //         const userToken =  ctx.session?.user.token;
    //         if(!userToken){
    //             throw new TRPCError({
    //                 code: 'UNAUTHORIZED',
    //                 message: 'Unauthorized'
    //             });
    //         }
    // const response = await fetch(`${env.BASE_URL}/incident/media/${input.incidentReportId}`, {
    //     method: 'GET',
    //     headers: {
    //         'authorization': `Bearer ${userToken}`,
    //         'Content-Type': 'application/json',
    //     },
    // });
    // console.log('response', response);
    // if (!response.ok) {
    //     const errorData:ErrorResponse = await response.json() as { message: string };
    //     console.error('incident assign error:', errorData);
    //     return {
    //         status: false,
    //         error: errorData.message,
    //     };
    // }
    // const data:GetMediaResponse = await response.json();
    // return {
    //     status: true,
    //     data: data,
    // };
    // } catch (error) {
    //     console.error('Incident error:', error);
    //     return {
    //         status: false,
    //         error: error instanceof Error ? error.message : 'An error occurred while logging in.',  
    //     };
    // }
    // })
    })
   