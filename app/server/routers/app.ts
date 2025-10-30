import { router } from "../createRouter";
import { modelsRouter } from "@/app/server/routers/models";
import { chatRouter } from "@/app/server/routers/chat";

export const appRouter = router({
  models: modelsRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
