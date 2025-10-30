import { z } from 'zod';
import { router, publicProcedure } from '../createRouter';
import { createClient } from '@supabase/supabase-js';

export const modelsRouter = router({
  getAvailable: publicProcedure.query(async ({ ctx }) => {
    const { data: models, error } = await ctx.supabase
      .from('models')
      .select('*');

    if (error) {
      throw new Error('Failed to fetch models');
    }

    return models;
  }),
});