import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { incidentRouter } from "./routers/incident";
import { employeeRouter } from "./routers/employees";
import { workerRouter } from "./routers/worker";
import { userRouter } from "./routers/user";
import { enumRouter } from "./routers/enum";
import { dashboardRouter } from "./routers/dashboard";
import { mediaRouter } from "./routers/media";
import { departmentRouter } from "./routers/department";
import { groupRouter } from "./routers/groups";
import { InspectionRouter } from "./routers/inspections";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  incidents: incidentRouter,
  workers: workerRouter,
  employees: employeeRouter,
  users: userRouter,
  enums: enumRouter,
  dashboard: dashboardRouter,
  media: mediaRouter,
  department: departmentRouter,
  groups: groupRouter,
  inspections: InspectionRouter,
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
