import { v } from "convex/values"

import { query } from "./_generated/server"

export const getEnv = query({
  args: {},
  returns: v.object({
    keys: v.array(v.string()),
    SITE_URL: v.optional(v.string()),
    CONVEX_SITE_URL: v.optional(v.string()),
  }),
  handler: async () => {
    return {
      keys: Object.keys(process.env),
      SITE_URL: process.env.SITE_URL,
      CONVEX_SITE_URL: process.env.CONVEX_SITE_URL,
    }
  },
})
