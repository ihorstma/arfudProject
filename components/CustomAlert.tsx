import React, { createContext, useContext, useState, ReactNode } from "react"
import { Modal, View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "./Text"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface CustomAlertContextType {
  showAlert: (title: string, message: string, onOk?: () => void) => void
}

const CustomAlertContext = createContext<CustomAlertContextType | undefined>(undefined)

export const useCustomAlert = () => {
  const context = useContext(CustomAlertContext)
  if (!context) {
    throw new Error("useCustomAlert must be used within a CustomAlertProvider")
  }
  return context
}

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [onOk, setOnOk] = useState<(() => void) | undefined>(undefined)
  const { themed } = useAppTheme()

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    setTitle(title)
    setMessage(message)
    setOnOk(() => onOk)
    setVisible(true)
  }

  const handleClose = () => {
    setVisible(false)
    if (onOk) onOk()
  }

  return (
    <CustomAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal transparent visible={visible} animationType="fade" onRequestClose={handleClose}>
        <View style={themed($overlay)}>
          <View style={themed($container)}>
            <Text preset="heading" text={title} style={themed($title)} />
            <Text text={message} style={themed($message)} />
            <TouchableOpacity onPress={handleClose} style={themed($button)}>
              <Text text="OK" style={themed($buttonText)} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </CustomAlertContext.Provider>
  )
}

const $overlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 320,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
})

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
  textAlign: "center",
})

const $message: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  textAlign: "center",
})

const $button: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  alignItems: "center",
})

const $buttonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
  fontWeight: "bold",
})
