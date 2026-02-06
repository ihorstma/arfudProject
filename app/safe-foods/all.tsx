import { useState } from "react"
import { FlatList, RefreshControl, TextStyle, View, ViewStyle } from "react-native"
import { Stack, useRouter } from "expo-router"
import { useConvex, useConvexAuth, useQuery } from "convex/react"

import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export default function SafeFoodsAllScreen() {
  const router = useRouter()
  const convex = useConvex()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth()
  const { themed } = useAppTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const foods = useQuery(api.foods.listAllFoods, isConvexAuthenticated ? {} : "skip") ?? []

  const onRefresh = async () => {
    if (!isConvexAuthenticated) return
    setIsRefreshing(true)
    try {
      await convex.query(api.foods.listAllFoods, {})
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <Stack.Screen options={{ title: "All Foods", headerShown: true }} />
      {isConvexAuthLoading ? (
        <View style={themed($empty)}>
          <Text text="Loading..." />
        </View>
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={themed($listContent)}
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
                <Text
                  text={`${item.isSafe ? "Safe" : "Unsafe"} / ${item.inStock ? "In Stock" : "Out of Stock"}`}
                />
              }
            />
          )}
        />
      )}
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $empty: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})
