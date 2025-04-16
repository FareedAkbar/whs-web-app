import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';

export const dashboardRouter = createTRPCRouter({

    getCounters: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
                const response = await fetch(`${env.BASE_URL}/admin/dashboard`, {
                    method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('enums getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const enumsData = await response.json() as DashboardStatsApiResponse;
        console.log('enumsData', enumsData);
        return {
            status: true,
            data: enumsData.data,
        };
    } catch (error) {
        console.error('enum error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    
    getWorkerCounters: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
                const response = await fetch(`${env.BASE_URL}/user/worker-counts`, {
                    method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('enums getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const counts = await response.json() as workerDashboardApiResponse;
        return {
            status: true,
            data: counts.data,
        };
    } catch (error) {
        console.error('enum error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while getting counters.',
        };
    }
        })
    })