import { Pressable, View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

interface TagPillProps {
  label: string
  color: string
  textColor?: string
  active: boolean
  onPress: () => void
}

export function TagPill({ label, color, textColor = "white", active, onPress }: TagPillProps) {
  const { themed } = useAppTheme()

  return (
    <Pressable onPress={onPress} style={themed($pill(active, color))}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text text={label} style={{ color: textColor }} />
        <Text text={active ? " -" : " +" } style={{ color: textColor, marginLeft: 4 }} />
      </View>
    </Pressable>
  )
}

const $pill = (active: boolean, color: string): ViewStyle => ({
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 3,
  backgroundColor: color,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
})
