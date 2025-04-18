import { TRPCError } from '@trpc/server';
import {createTRPCRouter, publicProcedure} from '../trpc';
import { env } from '@/env';
import { z } from 'zod';

export const userRouter = createTRPCRouter({

    getUsers: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/admin/all-users`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json',
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('users getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const usersData = await response.json() as UsersResponseData;
        return {
            status: true,
            data: usersData.users,
        };
    } catch (error) {
        console.error('user error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    getUser: publicProcedure
        .query( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/user/refresh`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `Bearer ${userToken}`,
            },
            
        });
      console.log('response', response);
        if (!response.ok) {
            const errorData = await response.json() as { message: string };
            console.error('users getting error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const usersData = await response.json() as UserResponseData;
        console.log('usersData', usersData);
        
        return {
            status: true,
            data: usersData.user,
        };
    } catch (error) {
        console.error('user error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        }),
    updateUser: publicProcedure
    .input(z.object({
        id: z.string(),
        role: z.string().optional(),
        isVerifiedByAdmin: z.boolean(),
    })).mutation( async ({ ctx, input }) => {
            try {
                const userToken =  ctx.session?.user.token;
                if(!userToken){
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized'
                    });
                }
        const response = await fetch(`${env.BASE_URL}/user/update`, {
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
            console.error('user update error:', errorData);
            return {
                status: false,
                error: errorData.message,
            };
        }

        const usersData = await response.json() as UpdateUserResponseData;
        return {
            status: true,
            data: usersData.user,
        };
    } catch (error) {
        console.error('user error:', error);
        return {
            status: false,
            error: error instanceof Error ? error.message : 'An error occurred while logging in.',
        };
    }
        })
    })
