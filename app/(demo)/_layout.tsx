import { ViewStyle, TextStyle, Pressable } from "react-native"
import { Text } from "react-native"
import { Tabs } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { EpisodeProvider } from "@/context/EpisodeContext"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { Image } from "react-native" 
import arfudHome from "@/assets/icons/arfudIconsLightMode/arfudHome.png"
import arfudDinnerBell from "@/assets/icons/arfudIconsLightMode/arfudDinnerBell.png"
import arfudJournal from "@/assets/icons/arfudIconsLightMode/arfudJournal.png"
import arfudOrange from "@/assets/icons/arfudIconsLightMode/arfudOrange.png"
import arfudPlus from "@/assets/icons/arfudIconsLightMode/arfudPlus.png"
import arfudShoppingCart from "@/assets/icons/arfudIconsLightMode/arfudShoppingCart.png"
import { useState } from "react"
import { useAddFoodTrigger } from "./store/useAddFoodTrigger"

export default function DemoLayout() {
  const setTrigger = useAddFoodTrigger((s) => s.setTrigger)
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
  <GestureHandlerRootView style={{ flex: 1 }}>
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
            tabBarLabel: "home",
            tabBarIcon: ({ focused }) => (
              <Image
                source={arfudHome}
                style={{ width: 30, height: 30 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            tabBarLabel: "journal",
            tabBarIcon: ({ focused }) => (
              <Image
                source={arfudJournal}
                style={{ width: 30, height: 30 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="food-grid"
          options={{
            tabBarLabel: "safe foods",
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? arfudPlus : arfudDinnerBell}
                style={{ width: 30, height: 30 }}
              />
           ),
          }}
          listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState()
            const isFocused =
            state.index === state.routes.findIndex(({ key }: { key: string }) => key === route.key)

            if (isFocused) {
              e.preventDefault()
              // this is where we trigger the modal
              useAddFoodTrigger.getState().setTrigger(true)
            }
          },
          })}
    
        />
        <Tabs.Screen
          name="chat-placeholder"
          options={{
            tabBarLabel: "chat",
            tabBarIcon: ({ focused }) => (
              <Image
                source={arfudOrange}
                style={{ width: 33, height: 33 }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="grocery-list"
          options={{
            tabBarLabel: ({ focused }) => (
              <Text style={{transform: [{ translateX: 4 }]}} >
                list
              </Text>
            ),
            tabBarIcon: ({ focused }) => (
              <Image
                source={arfudShoppingCart}
                style={{ width: 30, height: 30 }}
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
  </GestureHandlerRootView>
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
