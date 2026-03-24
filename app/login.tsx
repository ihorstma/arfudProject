import { ComponentType, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { Image, ImageStyle, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Button } from "@/components/Button"
import { useCustomAlert } from "@/components/CustomAlert"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, type TextFieldAccessoryProps } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { authClient } from "@/services/auth-client"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import ARFUDtxt from "../.../assets/icons/arfudIconsLightMode/ARFUDtxt.png"
import logintxt from "../.../assets/icons/arfudIconsLightMode/logintxt.png"

export default function LoginScreen() {
  const authPasswordInput = useRef<TextInput>(null)
  const router = useRouter()
  const { showAlert } = useCustomAlert()

  const [authPassword, setAuthPassword] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const { isAuthenticated } = useAuth()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(demo)/food-grid")
    }
  }, [isAuthenticated, router])

  const error = isSubmitted ? validationError : ""

  async function login() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    setIsLoading(true)

    const { error } = await authClient.signIn.email({
      email: authEmail,
      password: authPassword,
    })

    setIsLoading(false)

    if (error) {
      showAlert("Login Failed", error.message || "Something went wrong")
    } else {
      setIsSubmitted(false)
      setAuthPassword("")
      router.replace("/(demo)/food-grid")
    }
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral900}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral900],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={themed($screenContentContainer)}
      safeAreaEdges={["top", "bottom"]}
      style={{ backgroundColor: "#44A9D9" }}
    >
      <View style={themed($logoContainer)}>
        <Image source={require("@assets/icons/logo.png")} style={themed($logo)} />
        <Image source={require("@assets/icons/arfudIconsLightMode/ARFUDtxt.png")} style={{ width: 190, height: 60, marginTop: 8 }} />
        <Image source={require("@assets/icons/arfudIconsLightMode/logintxt.png")} style={{ width: 60, height: 20, marginTop: 8, marginBottom: 30 }} />
      </View>

      {attemptsCount > 2 && (
        <Text tx="loginScreen:hint" size="sm" weight="light" style={themed($hint)} />
      )}

      <TextField
        placeholder="email"
        value={authEmail}
        onChangeText={setAuthEmail}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        helper={error}
        status={error ? "error" : undefined}
        inputWrapperStyle={themed($authKitInputWrapper)}
        style={themed($authKitInput)}
        LabelTextProps={{ style: themed($authKitLabel) }}
        containerStyle={themed($textFieldContainer)}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
        textAlignVertical="center"
      />

      <TextField
        placeholder="password"
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        inputWrapperStyle={themed($authKitInputWrapper)}
        style={themed($authKitInput)}
        LabelTextProps={{ style: themed($authKitLabel) }}
        containerStyle={themed($textFieldContainer)}
        onSubmitEditing={login}
        RightAccessory={PasswordRightAccessory}
        textAlignVertical="center"
      />

      <Button
        testID="login-button"
        text="sign in"
        style={themed($authKitButton)}
        textStyle={themed($authKitSignInButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        onPress={login}
        disabled={isLoading}
      />

      {/* Divider */}
      <View style={themed($dividerContainer)}>
        <View style={themed($dividerLine)} />
        <Text text="or" size="xs" style={themed($dividerText)} />
        <View style={themed($dividerLine)} />
      </View>

      {/* Social Logins */}
      <Button
        text="continue with google"
        style={themed($authKitSocialButton)}
        textStyle={themed($authKitButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        LeftAccessory={(props) => (
          <View style={[props.style, themed($iconSpacing)]}>
            <Ionicons name="logo-google" size={20} color="black" />
          </View>
        )}
        onPress={() =>
          authClient.signIn.social({
            provider: "google",
            callbackURL: "arfud://(demo)/food-grid",
          })
        }
      />

      <Button
        text="continue with apple"
        style={themed($authKitSocialButton)}
        textStyle={themed($authKitButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        LeftAccessory={(props) => (
          <View style={[props.style, themed($iconSpacing)]}>
            <Ionicons name="logo-apple" size={20} color="black" />
          </View>
        )}
        onPress={() =>
          authClient.signIn.social({
            provider: "apple",
            callbackURL: "arfud://(demo)/food-grid",
          })
        }
      />

      <Button
        text="don't have an account? sign up"
        style={themed($linkButton)}
        textStyle={themed($linkButtonText)}
        onPress={() => router.push("/register")}
      />
    </Screen>
  )
}

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
  alignItems: "stretch",
})

const $logoContainer: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  height: 300,
  width: "100%",
  resizeMode: "contain",
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $textFieldContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $authKitInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: "#E0E0E0",
  borderRadius: 8,
  backgroundColor: colors.palette.neutral100,
  height: 48,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
})

const $authKitInput: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 20,
  flex: 1, // Allow input to fill the wrapper height
  paddingHorizontal: 12,
  marginVertical: 0,
  marginHorizontal: 0,
  paddingVertical: 0,
})

const $authKitLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: spacing.xs,
})

const $authKitButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "#E090B9",
  borderRadius: 8,
  height: 48,
  borderWidth: 0,
  marginTop: 8,
  marginBottom: 8,
})

const $authKitSocialButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "white",
  borderRadius: 8,
  height: 48,
  borderWidth: 0,
  marginTop: 8,
  marginBottom: 8,
})

const $authKitButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: "black",
  fontSize: 20,
  fontFamily: typography.primary.normal,
})

const $authKitSignInButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: "white",
  fontSize: 20,
  fontFamily: typography.primary.normal,
})

const $authKitButtonPressed: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#333333",
})

const $iconSpacing: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.sm,
})

const $linkButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  backgroundColor: "transparent",
  borderWidth: 0,
  alignSelf: "center",
})

const $linkButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: "white",
  textDecorationLine: "underline",
  fontSize: 16,
})

const $dividerContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginVertical: spacing.lg,
})

const $dividerLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: "#E6E6E6",
})

const $dividerText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginHorizontal: spacing.sm,
  color: "#E6E6E6",
})
