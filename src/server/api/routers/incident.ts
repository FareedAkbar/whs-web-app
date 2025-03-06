import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';
import { assign } from 'nodemailer/lib/shared';
import { z } from 'zod';

export const incidentRouter = createTRPCRouter({

    getIncidents: publicProcedure
        .query( async ({ ctx, input }) => {
            try {

                const userToken =  ctx.session?.user.token;
                console.log('userToken', userToken);
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/incident`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('incidents getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const incidentsData = await response.json() as IncidentApiResponse;
        return {
            status: true,
            data: incidentsData.data,
        };
    } catch (error) {
        console.error('Incident error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    assignIncident: publicProcedure
    .input(z.object({
        incidentReportId: z.string(),
        assignedTo: z.string(),
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
    const response = await fetch(`${env.BASE_URL}/incident/assign`, {
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
    const incidentsData = await response.json() as AssignIncidentApiResponse;
    return {
        status: true,   
        data: incidentsData.data,
    };
} catch (error) {
    console.error('Incident error:', error);
    return {
        status: false,
        error: error instanceof Error ? error.message : 'An error occurred while logging in.',
    };
}
    }),
    updateStatus: publicProcedure
    .input(z.object({
        incidentReportId: z.string(),
        status: z.string(),
        comments:z.string().optional(),
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
    const response = await fetch(`${env.BASE_URL}/incident/status`, {
        method: 'PUT',
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
    const incidentsData = await response.json() as AssignIncidentApiResponse;
    return {
        status: true,   
        data: incidentsData.data,
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