import { Platform } from "react-native"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"
import { expoClient } from "@better-auth/expo/client"
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || process.env.EXPO_PUBLIC_CONVEX_URL
if (!convexSiteUrl) {
  throw new Error("Missing EXPO_PUBLIC_CONVEX_SITE_URL or EXPO_PUBLIC_CONVEX_URL")
}

const scheme = (Constants.expoConfig?.scheme as string) || "arfud"

export const authClient = createAuthClient({
  baseURL: `${convexSiteUrl}/api/auth`,
  plugins: [
    convexClient(),
    ...(Platform.OS === "web"
      ? [crossDomainClient()]
      : [
          expoClient({
            scheme: scheme,
            storagePrefix: scheme,
            storage: SecureStore,
          }),
        ]),
  ],
})
