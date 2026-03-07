import { View } from "react-native"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"

export default function ChatPlaceholder() {
  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text text="Chat feature coming soon!" preset="subheading" />
      </View>
    </Screen>
  )
}
