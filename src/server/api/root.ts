import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { incidentRouter } from "./routers/incident";
import { contractorRouter } from "./routers/contractor";
import { employeeRouter } from "./routers/employees";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  incidents:incidentRouter,
  contractors:contractorRouter,
  employees:employeeRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
