import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';

export const workerRouter = createTRPCRouter({

    getWorkers: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/worker`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('workers getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const workersData = await response.json() as WorkerApiResponse;
        return {
            status: true,
            data: workersData.data,
        };
    } catch (error) {
        console.error('worker error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    })