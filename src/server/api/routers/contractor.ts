import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';

export const contractorRouter = createTRPCRouter({

    getContractors: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/contractor`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('contractors getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const contractorsData = await response.json() as ContractorApiResponse;
        return {
            status: true,
            data: contractorsData.data,
        };
    } catch (error) {
        console.error('contractor error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    })