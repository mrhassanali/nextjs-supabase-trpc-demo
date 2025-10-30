import { inferAsyncReturnType } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { createClient } from "@/lib/supabase/server";

export async function createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  return {
    req,
    resHeaders,
    user: user.data.user,
    supabase,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
