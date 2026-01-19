import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AuthProvider } from "@/context/AuthContext"
import { ConvexClientProvider } from "@/ConvexClientProvider"
import { initI18n } from "@/i18n"
import { ThemeProvider } from "@/theme/context"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"

export default function RootLayout() {
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ConvexClientProvider>
          <AuthProvider>
            <ThemeProvider>
              <Stack screenOptions={{ headerShown: false, animation: "fade", animationDuration: 30 }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="(demo)" />
              </Stack>
            </ThemeProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
