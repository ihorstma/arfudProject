import { type PropsWithChildren } from "react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "../services/auth-client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: PropsWithChildren) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
