import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';

export const incidentRouter = createTRPCRouter({

    getIncidents: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
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
            console.error('Login error:', errorData);
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
    })