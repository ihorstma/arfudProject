import { TextStyle, ViewStyle, View } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useIsFocused } from "@react-navigation/native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { EpisodeProvider } from "@/context/EpisodeContext"
import { translate } from "@/i18n/translate"
import { DemoDebugScreen } from "@/screens/DemoDebugScreen"
import { DemoPodcastListScreen } from "@/screens/DemoPodcastListScreen"
import { FoodGridScreen } from "@/screens/FoodGridScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { DemoTabParamList } from "./navigationTypes"
import { DemoShowroomScreen } from "@/screens/DemoShowroomScreen/DemoShowroomScreen"

const Tab = createBottomTabNavigator<DemoTabParamList>()

const withFade = (Component: React.ComponentType<any>) => {
  const WrappedComponent = (props: any) => {
    const isFocused = useIsFocused()
    return (
      <View style={$container}>
        {isFocused && (
          <Animated.View
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
            style={$container}
          >
            <Component {...props} />
          </Animated.View>
        )}
      </View>
    )
  }
  WrappedComponent.displayName = `withFade(${Component.displayName || Component.name})`
  return WrappedComponent
}

const WelcomeScreenFade = withFade(WelcomeScreen)
const FoodGridScreenFade = withFade(FoodGridScreen)
const DemoPodcastListScreenFade = withFade(DemoPodcastListScreen)
const DemoDebugScreenFade = withFade(DemoDebugScreen)

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function DemoNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <EpisodeProvider>
      <Tab.Navigator
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

        <Tab.Screen
          name="DemoShowroom"
          component={DemoShowroomScreen}
          options={{
            tabBarLabel: translate("demoNavigator:componentsTab"),
            tabBarIcon: ({ focused }) => (
              <Icon
                icon="components"
                color={focused ? colors.tint : colors.tintInactive}
                size={30}
              />
            ),
          }}
        />

        <Tab.Screen
          name="FoodGrid"
          component={FoodGridScreenFade}
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

        <Tab.Screen
          name="DemoPodcastList"
          component={DemoPodcastListScreenFade}
          options={{
            tabBarAccessibilityLabel: translate("demoNavigator:podcastListTab"),
            tabBarLabel: translate("demoNavigator:podcastListTab"),
            tabBarIcon: ({ focused }) => (
              <Icon icon="podcast" color={focused ? colors.tint : colors.tintInactive} size={30} />
            ),
          }}
        />

        <Tab.Screen
          name="DemoDebug"
          component={DemoDebugScreenFade}
          options={{
            tabBarLabel: translate("demoNavigator:debugTab"),
            tabBarIcon: ({ focused }) => (
              <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
            ),
          }}
        />
      </Tab.Navigator>
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

const $container: ViewStyle = {
  flex: 1,
}
