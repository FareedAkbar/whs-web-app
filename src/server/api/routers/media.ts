import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';
import { assign } from 'nodemailer/lib/shared';
import { z } from 'zod';

export const mediaRouter = createTRPCRouter({
    uploadMedia: publicProcedure
    .input(z.object({
        // incidentReportId: z.string(),
        media: z.any(),
    }))
    .mutation( async ({ ctx, input }) => {
        try {
            const userToken =  ctx.session?.user.token;
            if(!userToken){
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized'
                });
            }
    const response = await fetch(`${env.BASE_URL}/media`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });
    console.log('response', response);
    if (!response.ok) {
        const errorData = await response.json() as { message: string };
        console.error('incident assign error:', errorData);
        return {
            status: false,
            error: errorData.message,
        };
    }
    const data:UploadMediaApiResponse = await response.json();
    return {
        status: true,
        data: data.fileUrls,
    };
    } catch (error) {
        console.error('Incident error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',  
        };
    }
    }), 
    getMedia: publicProcedure
    .input(z.object({
        incidentReportId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
        try {
            const userToken =  ctx.session?.user.token;
            if(!userToken){
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized'
                });
            }
    const response = await fetch(`${env.BASE_URL}/incident/media/${input.incidentReportId}`, {
        method: 'GET',
        headers: {
            'authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
        },
    });
    console.log('response', response);
    if (!response.ok) {
        const errorData = await response.json() as { message: string };
        console.error('incident assign error:', errorData);
        return {
            status: false,
            error: errorData.message,
        };
    }
    const data = await response.json();
    return {
        status: true,
        data: data,
    };
    } catch (error) {
        console.error('Incident error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',  
        };
    }
    })
    })
   