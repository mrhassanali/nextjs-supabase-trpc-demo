import { z } from "zod";
import { router, publicProcedure } from "../createRouter";

export const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        modelTag: z.string(),
        prompt: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Verify model exists
      const { data: model, error: modelError } = await ctx.supabase
        .from("models")
        .select("tag")
        .eq("tag", input.modelTag)
        .single();

      if (modelError || !model) {
        throw new Error(`Invalid model tag: ${input.modelTag}`);
      }

      // Store user message
      const { error: userMessageError } = await ctx.supabase.from("messages").insert({
        user_id: ctx.user.id,
        model_tag: input.modelTag,
        role: "user",
        content: input.prompt,
        created_at: new Date().toISOString(),
      });

      if (userMessageError) {
        console.error("User message error:", userMessageError);
        throw new Error(`Failed to store message: ${userMessageError.message}`);
      }

      // Simulate AI response (replace with actual API call)
      const aiResponse = `You said: ${input.prompt}`;

      // Store AI response
      const { error: aiMessageError } = await ctx.supabase.from("messages").insert({
        user_id: ctx.user.id,
        model_tag: input.modelTag,
        role: "assistant",
        content: aiResponse,
        created_at: new Date().toISOString(),
      });

      if (aiMessageError) {
        console.error("AI message error:", aiMessageError);
        throw new Error(`Failed to store AI response: ${aiMessageError.message}`);
      }

      return { response: aiResponse };
    }),

  history: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }

    const { data: messages, error } = await ctx.supabase
      .from("messages")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch message history");
    }

    return messages;
  }),
});
