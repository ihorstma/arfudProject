import { ViewStyle, TextStyle } from "react-native"
import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { EpisodeProvider } from "@/context/EpisodeContext"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export default function DemoLayout() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <EpisodeProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: themed([$tabBar, { height: bottom + 60, paddingBottom: bottom }]),
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text,
          tabBarLabelStyle: themed($tabBarLabel),
          tabBarItemStyle: themed($tabBarItem),
        }}
      >
        <Tabs.Screen
          name="food-grid"
          options={{
            title: "Safe Foods",
            tabBarLabel: "Foods",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="food-apple"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="showroom"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="safe-food-manager"
          options={{
            title: "Manage",
            tabBarLabel: "Manage",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="view-grid-plus-outline"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="podcast"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="debug"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </EpisodeProvider>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopWidth: 1,
  backgroundColor: colors.background,
  borderTopColor: colors.separator,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xxs,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  fontFamily: typography.primary.medium,
  lineHeight: 12,
  color: colors.text,
})
