import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"
import { expoClient } from "@better-auth/expo/client"
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import Constants from "expo-constants"

const convexSiteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL || process.env.EXPO_PUBLIC_CONVEX_URL
const scheme = Constants.expoConfig?.scheme as string || "arfud"

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