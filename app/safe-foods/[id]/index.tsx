import { Alert, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useConvexAuth, useMutation, useQuery } from "convex/react"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function SafeFoodDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth()

  const foodId = id as Id<"foods">
  const food = useQuery(api.foods.getFoodById, isConvexAuthenticated ? { id: foodId } : "skip")

  const deleteFood = useMutation(api.foods.deleteFood)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)

  const handleDelete = () => {
    if (!food) return
    Alert.alert("Delete food", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFood({ id: food._id })
            router.replace("/food-grid")
          } catch {
            Alert.alert("Delete failed", "Unable to delete this food.")
          }
        },
      },
    ])
  }

  const handleStockToggle = async () => {
    if (!food) return
    try {
      if (food.inStock) {
        await markOutOfStock({ id: food._id })
      } else {
        await setInStock({ id: food._id, inStock: true })
      }
    } catch {
      Alert.alert("Update failed", "Unable to update stock status.")
    }
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($content)}
    >
      <Stack.Screen options={{ title: food?.name || "Food Details", headerShown: true }} />
      {isConvexAuthLoading || food === undefined ? (
        <Text text="Loading..." />
      ) : !food ? (
        <View style={themed($empty)}>
          <Text text="Food not found." />
          <Button text="Back to Foods" onPress={() => router.replace("/food-grid")} />
        </View>
      ) : (
        <>
          <Image
            source={{ uri: food.imageUrl || "https://loremflickr.com/700/500/food" }}
            style={themed($heroImage)}
            resizeMode="cover"
          />

          <View style={themed($badgeRow)}>
            <View style={themed([$badge, food.isSafe ? $safeBadge : $unsafeBadge])}>
              <Text text={food.isSafe ? "Safe" : "Unsafe"} style={themed($badgeText)} />
            </View>
            <View style={themed([$badge, food.inStock ? $stockBadge : $outBadge])}>
              <Text text={food.inStock ? "In Stock" : "Out of Stock"} style={themed($badgeText)} />
            </View>
          </View>

          <View style={themed($section)}>
            {!!food.description && <Text text={food.description} selectable />}
            <Text text={`Category: ${food.category}`} selectable />
            <Text text={`Texture: ${food.texture}`} selectable />
            <Text text={`Temperature: ${food.temperature}`} selectable />
            {!!food.imageUrl && <Text text={`Image URL: ${food.imageUrl}`} selectable />}
            {!!food.tags?.length && <Text text={`Tags: ${food.tags.join(", ")}`} selectable />}
          </View>

          <View style={themed($actions)}>
            <Button text="Edit" onPress={() => router.push(`/safe-foods/${food._id}/edit`)} />
            <Button
              text={food.inStock ? "Mark Out of Stock" : "Mark In Stock"}
              preset="reversed"
              onPress={handleStockToggle}
            />
            <Button text="Delete" preset="default" onPress={handleDelete} />
          </View>
        </>
      )}
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
})

const $heroImage: ThemedStyle<ImageStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderRadius: 18,
  height: 220,
  width: "100%",
})

const $badgeRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 999,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $safeBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary100,
})

const $unsafeBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.angry100,
})

const $stockBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.accent100,
})

const $outBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
  fontSize: 12,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.separator,
  borderRadius: 16,
  borderWidth: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $empty: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})
