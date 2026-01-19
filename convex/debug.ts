import { query } from "./_generated/server";

export const getEnv = query({
  handler: async () => {
    return {
      keys: Object.keys(process.env),
      SITE_URL: process.env.SITE_URL,
      CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
    };
  },
});
