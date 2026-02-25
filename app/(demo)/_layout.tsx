import { ViewStyle, TextStyle } from "react-native"
import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { EpisodeProvider } from "@/context/EpisodeContext"
import { translate } from "@/i18n/translate"
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
          name="home"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="home-outline"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            tabBarLabel: "Journal",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="book-open-outline"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="food-grid"
          options={{
            tabBarLabel: "Safe Foods",
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
          name="chat-placeholder"
          options={{
            tabBarLabel: "Chat",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="chat-outline"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="grocery-list"
          options={{
            tabBarLabel: "List",
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="cart-outline"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />
        <Tabs.Screen name="safe-food-manager" options={{ href: null }} />
        <Tabs.Screen
          name="debug"
          options={{
            tabBarLabel: translate("demoNavigator:debugTab"),
            tabBarIcon: ({ focused }) => (
              <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
            ),
          }}
        />
        <Tabs.Screen name="showroom" options={{ href: null }} />
        <Tabs.Screen name="podcast" options={{ href: null }} />
        <Tabs.Screen name="demos" options={{ href: null }} />
        <Tabs.Screen name="DrawerIconButton" options={{ href: null }} />
        <Tabs.Screen name="SectionListWithKeyboardAwareScrollView" options={{ href: null }} />
        <Tabs.Screen name="DemoDivider" options={{ href: null }} />
        <Tabs.Screen name="DemoUseCase" options={{ href: null }} />
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
