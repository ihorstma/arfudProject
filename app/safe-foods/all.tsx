import { FlatList, View, ViewStyle, TextStyle } from "react-native"
import { useRouter } from "expo-router"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export default function SafeFoodsAllScreen() {
  const router = useRouter()
  const { themed } = useAppTheme()
  const foods = useQuery(api.foods.listAllFoods) ?? []

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        contentContainerStyle={themed($listContent)}
        ListHeaderComponent={
          <View style={themed($header)}>
            <PressableIcon icon="back" onPress={() => router.navigate("/food-grid")} />
            <Text preset="heading" text="All Foods" />
          </View>
        }
        ListEmptyComponent={<Text text="No foods yet." style={themed($empty)} />}
        renderItem={({ item }) => (
          <Card
            style={themed($card)}
            onPress={() => router.push(`/safe-foods/${item._id}`)}
            HeadingComponent={<Text preset="bold" text={item.name} />}
            ContentComponent={
              <View>
                {!!item.description && <Text text={item.description} />}
                <Text text={`${item.category} / ${item.texture} / ${item.temperature}`} />
              </View>
            }
            FooterComponent={
              <Text text={`${item.isSafe ? "Safe" : "Unsafe"} / ${item.inStock ? "In Stock" : "Out of Stock"}`} />
            }
          />
        )}
      />
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.md,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $empty: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})
