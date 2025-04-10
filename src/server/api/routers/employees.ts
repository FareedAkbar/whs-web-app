import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';

export const employeeRouter = createTRPCRouter({

    getEmployees: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/admin/all-users?employees=true`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('employees getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const employeesData = await response.json() as UsersResponseData;
        return {
            status: true,
            data: employeesData.users,
        };
    } catch (error) {
        console.error('employee error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    })