import { useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Image,
  ImageStyle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useArchiveMode } from "./store/useArchiveMode"

const router = useRouter()
const { width } = Dimensions.get("window")
const MENU_WIDTH = width * 0.8

export default function HomeScreen() {
  const { themed, theme } = useAppTheme()
  const { top, bottom } = useSafeAreaInsets()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const setArchiveOpen = useArchiveMode(s => s.setArchiveOpen)
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current

  // A more robust Donut chart placeholder
  const DonutPlaceholder = ({ color, percent }: { color: string; percent: number }) => {
    return (
      <View style={[$donutContainer, { backgroundColor: "#F3F4F6" }]}>
        <View
          style={[
            $donutFill,
            {
              backgroundColor: color,
              height: `${percent}%`,
              bottom: 0,
              width: "100%",
              position: "absolute",
            },
          ]}
        />
        <View style={[$donutInner, { backgroundColor: "white" }]}>
          <Text text={`${percent}%`} style={{ fontSize: 10, color: "#6B7280" }} />
        </View>
      </View>
    )
  }

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -MENU_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isMenuOpen])

  const renderAboutModal = () => (
    <Modal
      visible={isAboutOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsAboutOpen(false)}
    >
      <View style={[$styles.flex1, { backgroundColor: "#FF7EB3" }]}>
        <View style={[themed($aboutHeader), { paddingTop: top }]}>
          <TouchableOpacity onPress={() => setIsAboutOpen(false)} style={themed($iconButton)}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="white" />
          </TouchableOpacity>
          <Text text="about arfüd" style={themed($aboutHeaderText)} />
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={themed($aboutContent)}>
          <Text 
            text="arfüd is a supportive space for people navigating selective and avoidant eating, especially within the neurodivergent community. rooted in empathy, service, and compassion, the app offers simple, practical tools to help you build self-trust around food at your own pace."
            style={themed($aboutParagraph)}
          />
          <Text 
            text="we know eating struggles are complex, and progress can look different for everyone. that's why arfüd focuses on gentle encouragement, emotional validation, and helpful features to make food feel less overwhelming. whether you're working toward trying new foods or just finding more comfort with eating, we're here to remind you that every step counts—and you don't have to do it alone."
            style={themed($aboutParagraph)}
          />
          <View style={themed($aboutDivider)} />
          <Text 
            text="arfüd was designed by rigby wolff, a neurodivergent person with arfid, to create the kind of support they wish they had. at arfüd, we believe in serving our community with love, compassion, and respect for every individual's unique journey."
            style={[themed($aboutParagraph), { fontFamily: theme.typography.primary.medium }]}
          />
          
          <View style={themed($aboutLogoContainer)}>
             <Image 
                source={require("@assets/icons/logo.png")}
                style={themed($aboutLogo)} 
                resizeMode="contain"
              />
              <Text text="serving with love." style={themed($aboutFooterText)} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  )

  const renderSettingsModal = () => (
    <Modal
      visible={isSettingsOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsSettingsOpen(false)}
    >
      <View style={[$styles.flex1, { backgroundColor: "white" }]}>
        <View style={[themed($settingsHeader), { paddingTop: top }]}>
          <TouchableOpacity onPress={() => setIsSettingsOpen(false)} style={themed($iconButton)}>
            <MaterialCommunityIcons name="arrow-left" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={themed($settingsContent)}>
          <Text text="settings" style={themed($settingsTitle)} />
          
          <View style={themed($searchContainer)}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="search for a setting"
              placeholderTextColor="#9CA3AF"
              style={themed($searchInput)}
            />
            <MaterialCommunityIcons name="microphone-outline" size={20} color="#6B7280" />
          </View>

          <View style={themed($settingsList)}>
            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#BE185D" }]}>
                <MaterialCommunityIcons name="account-outline" size={24} color="white" />
              </View>
              <Text text="account" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#F472B6" }]}>
                <MaterialCommunityIcons name="volume-high" size={24} color="white" />
              </View>
              <Text text="sounds" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#38BDF8" }]}>
                <MaterialCommunityIcons name="eye-outline" size={24} color="white" />
              </View>
              <Text text="visual" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#A3E635" }]}>
                <MaterialCommunityIcons name="headphones" size={24} color="white" />
              </View>
              <Text text="help & support" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#1D4ED8" }]}>
                <MaterialCommunityIcons name="shield-lock-outline" size={24} color="white" />
              </View>
              <Text text="privacy & security" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={themed($settingRow)}>
              <View style={[themed($settingIconBg), { backgroundColor: "#15803D" }]}>
                <MaterialCommunityIcons name="credit-card-outline" size={24} color="white" />
              </View>
              <Text text="manage subscription" style={themed($settingText)} />
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )

  const renderSideMenu = () => (
    <>
      {isMenuOpen && (
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => setIsMenuOpen(false)}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} />
        </Pressable>
      )}
      <Animated.View 
        style={[
          themed($menuContainer), 
          { 
            paddingTop: top,
            transform: [{ translateX: slideAnim }],
            width: MENU_WIDTH,
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }
        ]}
      >
        <View style={themed($menuHeader)}>
          <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={themed($iconButton)}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={themed($menuScroll)} bounces={false}>
          <Text text="menu" style={themed($menuTitle)} />

          <View style={themed($menuItems)}>
            <TouchableOpacity style={themed($menuItemRow)}>
              <MaterialCommunityIcons name="card-account-details-outline" size={24} color="white" />
              <Text text="view profile" style={themed($menuItemText)} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={themed($menuItemRow)}
              onPress={() => {
                setIsMenuOpen(false)
                setArchiveOpen(true)
                router.push("/food-grid")
              }}
            >
              <MaterialCommunityIcons name="book-outline" size={24} color="white" />
              <Text text="food archive" style={themed($menuItemText)} />
            </TouchableOpacity>

            <TouchableOpacity style={themed($menuItemRow)}>
              <MaterialCommunityIcons name="storefront-outline" size={24} color="white" />
              <Text text="shop" style={themed($menuItemText)} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={themed($menuItemRow)}
              onPress={() => {
                setIsMenuOpen(false)
                setIsSettingsOpen(true)
              }}
            >
              <MaterialCommunityIcons name="wrench-outline" size={24} color="white" />
              <Text text="settings" style={themed($menuItemText)} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={themed($menuItemRow)} 
              onPress={() => {
                setIsMenuOpen(false)
                setIsAboutOpen(true)
              }}
            >
              <MaterialCommunityIcons name="message-question-outline" size={24} color="white" />
              <Text text="about" style={themed($menuItemText)} />
            </TouchableOpacity>
          </View>

          <View style={themed($menuFooter)}>
            <TouchableOpacity style={themed($footerLink)}>
              <Text text="terms of service" style={themed($footerLinkText)} />
            </TouchableOpacity>
            <TouchableOpacity style={themed($footerLink)}>
              <Text text="privacy policy" style={themed($footerLinkText)} />
            </TouchableOpacity>
            <TouchableOpacity style={[themed($footerLink), { marginTop: 24 }]}>
              <Text text="logout" style={[themed($footerLinkText), { fontFamily: theme.typography.primary.bold }]} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  )

  return (
    <View style={$styles.flex1}>
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        backgroundColor="#4BA3E3"
        systemBarStyle="light"
        style={themed($screenBackground)}
        contentContainerStyle={themed($scrollContent)}
      >
        <View style={themed($header)}>
          <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={themed($iconButton)}>
            <MaterialCommunityIcons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <View style={themed($heroSection)}>
          <View style={themed($heroTextContainer)}>
            <Text text="welcome" style={themed($heroText)} />
            <Text text="home." style={themed($heroText)} />
            <Text text="what would" style={[themed($heroText), { marginTop: 16 }]} />
            <Text text="you like to eat" style={themed($heroText)} />
            <Text text="today, rigby?" style={themed($heroText)} />
          </View>
          
          <Image 
            source={require("@assets/icons/logo.png")}
            style={themed($heroImage)} 
            resizeMode="contain"
          />
        </View>

        <View style={[themed($checkInCard), { paddingBottom: Math.max(bottom + 80, 100) }]}>
          <Text text="check-in" style={themed($checkInTitle)} />

          <View style={themed($progressRow)}>
            <DonutPlaceholder color="#F472B6" percent={33} />
            <View style={themed($progressTextContainer)}>
              <Text text="one of three meals eaten" style={[themed($progressTitle), { color: "#F472B6" }]} />
              <TouchableOpacity>
                <Text text="edit this goal" style={themed($progressSubtitle)} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={themed($progressRow)}>
            <DonutPlaceholder color="#38BDF8" percent={50} />
            <View style={themed($progressTextContainer)}>
              <Text text="one of two snacks eaten" style={[themed($progressTitle), { color: "#38BDF8" }]} />
              <TouchableOpacity>
                <Text text="edit this goal" style={themed($progressSubtitle)} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={themed($progressRow)}>
            <DonutPlaceholder color="#86EFAC" percent={35} />
            <View style={themed($progressTextContainer)}>
              <Text text="35% of calories eaten" style={[themed($progressTitle), { color: "#86EFAC" }]} />
              <TouchableOpacity>
                <Text text="edit this goal" style={themed($progressSubtitle)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Screen>

      {renderSideMenu()}
      {renderAboutModal()}
      {renderSettingsModal()}
    </View>
  )
}

const $screenBackground: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#4BA3E3",
})

const $scrollContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
})

const $iconButton: ThemedStyle<ViewStyle> = () => ({
  padding: 4,
})

const $heroSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
  flexDirection: "row",
  justifyContent: "space-between",
})

const $heroTextContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $heroText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 36,
  fontFamily: typography.primary.bold,
  color: "white",
  letterSpacing: -1,
  lineHeight: 40,
})

const $heroImage: ThemedStyle<ImageStyle> = () => ({
  width: 140,
  height: 140,
  position: "absolute",
  right: 0,
  top: -10,
  tintColor: "#F59E0B",
})

const $checkInCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "white",
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  flex: 1,
  paddingHorizontal: spacing.xl,
  paddingTop: 48,
  marginTop: 20,
})

const $checkInTitle: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontSize: 32,
  fontFamily: typography.primary.bold,
  color: "#F59E0B",
  textAlign: "center",
  marginBottom: spacing.xl,
  lineHeight: 40,
})

const $progressRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xl,
})

const $progressTextContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginLeft: spacing.lg,
  justifyContent: "center",
})

const $progressTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  marginBottom: 2,
})

const $progressSubtitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
  color: "#9CA3AF",
})

const $donutContainer: ViewStyle = {
  width: 70,
  height: 70,
  borderRadius: 35,
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
}

const $donutFill: ViewStyle = {
  position: "absolute",
}

const $donutInner: ViewStyle = {
  width: 46,
  height: 46,
  borderRadius: 23,
  justifyContent: "center",
  alignItems: "center",
}

// Menu Styles

const $menuContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "#3A0CA3",
})

const $menuHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg,
})

const $menuScroll: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xxl,
  paddingBottom: spacing.xxl,
  paddingTop: spacing.xs,
})

const $menuTitle: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontSize: 48,
  fontFamily: typography.primary.bold,
  color: "white",
  marginBottom: spacing.xl,
  lineHeight: 56,
  marginTop: spacing.sm,
})

const $menuItems: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  marginBottom: spacing.xxxl,
})

const $menuItemRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 16,
})

const $menuItemText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 20,
  fontFamily: typography.primary.medium,
  color: "white",
})

const $menuFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: "auto",
  gap: spacing.sm,
})

const $footerLink: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 4,
})

const $footerLinkText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: "white",
})

// About Modal Styles

const $aboutHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingBottom: 16,
})

const $aboutHeaderText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: "white",
})

const $aboutContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $aboutParagraph: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.normal,
  color: "white",
  lineHeight: 26,
  marginBottom: 24,
})

const $aboutDivider: ThemedStyle<ViewStyle> = () => ({
  height: 2,
  backgroundColor: "rgba(255,255,255,0.3)",
  marginBottom: 24,
  width: "30%",
})

const $aboutLogoContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  marginTop: 20,
  gap: 12,
})

const $aboutLogo: ThemedStyle<ImageStyle> = () => ({
  width: 80,
  height: 80,
  tintColor: "white",
})

const $aboutFooterText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: "white",
  opacity: 0.8,
})

// Settings Modal Styles

const $settingsHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingBottom: 16,
})

const $settingsContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $settingsTitle: ThemedStyle<TextStyle> = ({ typography, spacing }) => ({
  fontSize: 42,
  fontFamily: typography.primary.bold,
  color: "black",
  marginBottom: spacing.xl,
  lineHeight: 50, // Added to prevent clipping
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F3F4F6",
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: 10,
  marginBottom: spacing.xl,
})

const $searchInput: ThemedStyle<TextStyle> = ({ typography }) => ({
  flex: 1,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: "black",
  paddingHorizontal: 8,
  paddingVertical: 0,
})

const $settingsList: ThemedStyle<ViewStyle> = () => ({
  // Container for the list
})

const $settingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "#F3F4F6",
})

const $settingIconBg: ThemedStyle<ViewStyle> = () => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 16,
})

const $settingText: ThemedStyle<TextStyle> = ({ typography }) => ({
  flex: 1,
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: "black",
})

