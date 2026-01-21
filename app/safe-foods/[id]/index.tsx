import { useMemo } from "react"
import { Alert, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function SafeFoodDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()

  const foodId = id as Id<"foods">
  const food = useQuery(api.foods.getFoodById, { id: foodId })

  const deleteFood = useMutation(api.foods.deleteFood)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)

  const stockLabel = useMemo(() => {
    if (!food) return "Update Stock"
    return food.inStock ? "Mark Out of Stock" : "Mark In Stock"
  }, [food])

  const handleDelete = () => {
    if (!food) return
    Alert.alert("Delete food", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteFood({ id: food._id })
          router.navigate("/food-grid")
        },
      },
    ])
  }

  const handleStockToggle = async () => {
    if (!food) return
    if (food.inStock) {
      await markOutOfStock({ id: food._id })
    } else {
      await setInStock({ id: food._id, inStock: true })
    }
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($content)}>
      {!food ? (
        <Text text="Loading..." />
      ) : (
        <>
          <View style={themed($headerRow)}>
            <PressableIcon icon="back" onPress={() => router.navigate("/food-grid")} />
            <Text preset="heading" text={food.name} />
          </View>
          <Card
            style={themed($card)}
            HeadingComponent={<Text preset="bold" text="Details" />}
            ContentComponent={
              <View style={themed($details)}>
                {!!food.description && <Text text={food.description} />}
                <Text text={`Category: ${food.category}`} />
                <Text text={`Texture: ${food.texture}`} />
                <Text text={`Temperature: ${food.temperature}`} />
                <Text text={`Safe: ${food.isSafe ? "Yes" : "No"}`} />
                <Text text={`Stock: ${food.inStock ? "In Stock" : "Out of Stock"}`} />
                {!!food.imageUrl && <Text text={`Image: ${food.imageUrl}`} />}
                {!!food.tags?.length && <Text text={`Tags: ${food.tags.join(", ")}`} />}
              </View>
            }
          />

          <View style={themed($actions)}>
            <Button text="Edit" onPress={() => router.push(`/safe-foods/${food._id}/edit`)} />
            <Button text={stockLabel} preset="reversed" onPress={handleStockToggle} />
            <Button text="Delete" preset="default" onPress={handleDelete} />
          </View>
        </>
      )}
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  gap: spacing.md,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $details: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  marginTop: spacing.xs,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})
