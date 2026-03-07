import { ComponentType, useMemo, useRef, useState, useEffect } from "react"
// eslint-disable-next-line no-restricted-imports
import { Alert, Image, ImageStyle, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, type TextFieldAccessoryProps } from "@/components/TextField"
import { useAuth } from "@/context/AuthContext"
import { authClient } from "@/services/auth-client"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function RegisterScreen() {
  const authPasswordInput = useRef<TextInput>(null)
  const authNameInput = useRef<TextInput>(null)
  const router = useRouter()

  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  async function register() {
    setIsSubmitted(true)

    if (validationError) return
    if (!authName) {
      Alert.alert("Missing Name", "Please enter your full name.")
      return
    }

    setIsLoading(true)

    const { error } = await authClient.signUp.email({
      email: authEmail,
      password: authPassword,
      name: authName,
    })

    setIsLoading(false)

    if (error) {
      console.error("Sign Up Error Details:", JSON.stringify(error, null, 2))
      Alert.alert("Sign Up Failed", error.message || "Something went wrong")
    } else {
      Alert.alert("Success", "Account created successfully!")
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
    >
      <View style={themed($logoContainer)}>
        <Image source={require("@assets/icons/logo.png")} style={themed($logo)} />
      </View>

      <TextField
        value={authName}
        onChangeText={setAuthName}
        label="Name"
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect={false}
        inputWrapperStyle={themed($authKitInputWrapper)}
        style={themed($authKitInput)}
        LabelTextProps={{ style: themed($authKitLabel) }}
        containerStyle={themed($textFieldContainer)}
        onSubmitEditing={() => authNameInput.current?.focus()}
        textAlignVertical="center"
      />

      <TextField
        ref={authNameInput}
        value={authEmail}
        onChangeText={setAuthEmail}
        label="Email"
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
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        label="Password"
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        inputWrapperStyle={themed($authKitInputWrapper)}
        style={themed($authKitInput)}
        LabelTextProps={{ style: themed($authKitLabel) }}
        containerStyle={themed($textFieldContainer)}
        onSubmitEditing={register}
        RightAccessory={PasswordRightAccessory}
        textAlignVertical="center"
      />

      <Button
        testID="register-button"
        text="Sign-up"
        style={themed($authKitButton)}
        textStyle={themed($authKitButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        onPress={register}
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
        text="Continue with Google"
        style={themed($authKitSocialButton)}
        textStyle={themed($authKitButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        LeftAccessory={(props) => (
          <View style={[props.style, themed($iconSpacing)]}>
            <Ionicons name="logo-google" size={20} color={colors.palette.neutral100} />
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
        text="Continue with Apple"
        style={themed($authKitSocialButton)}
        textStyle={themed($authKitButtonText)}
        pressedStyle={themed($authKitButtonPressed)}
        LeftAccessory={(props) => (
          <View style={[props.style, themed($iconSpacing)]}>
            <Ionicons name="logo-apple" size={20} color={colors.palette.neutral100} />
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
        text="Already have an account? Sign-in"
        style={themed($linkButton)}
        textStyle={themed($linkButtonText)}
        onPress={() => router.back()}
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

const $textFieldContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $authKitInputWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.palette.neutral900,
  borderRadius: 4,
  backgroundColor: colors.palette.neutral100,
  height: 48,
  alignItems: "stretch",
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
  backgroundColor: colors.palette.neutral900,
  borderRadius: 4,
  height: 48,
  borderWidth: 0,
  marginTop: 8,
  marginBottom: 8,
})

const $authKitSocialButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral900,
  borderRadius: 4,
  height: 48,
  borderWidth: 0,
  marginTop: 8,
  marginBottom: 8,
})

const $authKitButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
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
  color: colors.text,
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
  backgroundColor: colors.palette.neutral300,
})

const $dividerText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginHorizontal: spacing.sm,
  color: colors.textDim,
})
