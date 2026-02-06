import { type PropsWithChildren } from "react"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"

import { authClient } from "./services/auth-client"

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL
if (!convexUrl) {
  throw new Error("Missing EXPO_PUBLIC_CONVEX_URL")
}

const convex = new ConvexReactClient(convexUrl)

export function ConvexClientProvider({ children }: PropsWithChildren) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  )
}
