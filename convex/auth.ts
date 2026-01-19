import { createClient, type GenericCtx } from "@convex-dev/better-auth"
import { convex, crossDomain } from "@convex-dev/better-auth/plugins"
import { betterAuth } from "better-auth/minimal"
import { expo } from "@better-auth/expo"

import { components } from "./_generated/api"
import { DataModel } from "./_generated/dataModel"
import { query } from "./_generated/server"
import authConfig from "./auth.config"

const siteUrl = process.env.SITE_URL || "http://localhost:3000"
const convexSiteUrl = process.env.CONVEX_SITE_URL || process.env.SITE_URL

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth)

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: convexSiteUrl,
    database: authComponent.adapter(ctx),
    trustedOrigins: ["arfud://", "exp://", siteUrl],
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      expo(),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
      crossDomain({ siteUrl }),
    ],
  })
}

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return authComponent.getAuthUser(ctx);
    },
});

export const getEnv = query({
  handler: async () => {
    return {
      SITE_URL: process.env.SITE_URL,
      HAS_SECRET: !!process.env.BETTER_AUTH_SECRET,
    };
  },
});
