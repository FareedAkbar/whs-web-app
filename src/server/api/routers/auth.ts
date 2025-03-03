import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
    login: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            try {
                const response = await fetch(`${env.BASE_URL}/user/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(input),
                });

                if (!response.ok) {
                    const errorData = await response.json() as { message: string };
                    console.error('Login error:', errorData);
                    return {
                        status: false,
                        error: errorData.message,
                    };
                }

                const userData = await response.json() as LoginResponseData;
                return {
                    status: true,
                    user: userData.user,
                    token: userData.token,
                };
            } catch (error) {
                console.error('Login error:', error);
                return {
                    status: false,
                    error: 'An error occurred while logging in.',
                };
            }
        }),

    verifyOtp: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                otp: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            //
        }),

    register: publicProcedure
        .input(
            z.object({
                username: z.string(),
                fName: z.string(),
                lName: z.string(),
                email: z.string().email(),
                password: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            console.log(input)
            try {
                const user = {
                    name: `${input.fName} ${input.lName}`,
                    username: input.username,
                    email: input.email,
                    password: input.password,
                    phoneNumber: '',
                };

                const response = await fetch(`${env.BASE_URL}/user/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user),
                });
                console.log(response)
                if (!response.ok) {
                    const error = (await response.json()) as { error: string };
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: error.error,
                    });
                }
                const userData = await response.json() as unknown;

                console.log(userData);

                return {
                    status: true,
                };
            } catch (error: unknown) {
                console.error('Network error:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'An unknown error occurred',
                });
            }
        }),

    updatePassword: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            //
            console.log(ctx, input)
            return true;
        }),
});
