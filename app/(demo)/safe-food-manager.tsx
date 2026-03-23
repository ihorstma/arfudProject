import { useMemo, useState } from "react"
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

type StockFilter = "all" | "in" | "out"
type SortMode = "updated" | "name" | "category"

const getLabel = (mode: SortMode) => {
  if (mode === "name") return "A-Z"
  if (mode === "category") return "Category"
  return "Recent"
}

export default function SafeFoodManagerScreen() {
  const router = useRouter()
  const convex = useConvex()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth()
  const { themed } = useAppTheme()
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [activeCategory, setActiveCategory] = useState("")
  const [activeTexture, setActiveTexture] = useState("")
  const [activeTemperature, setActiveTemperature] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("updated")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const deleteFood = useMutation(api.foods.deleteFood)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)

  const allFoods = useQuery(api.foods.listAllFoods, isConvexAuthenticated ? {} : "skip")

  const categories = useMemo(
    () =>
      Array.from(new Set((allFoods ?? []).map((item) => item.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [allFoods],
  )
  const textures = useMemo(
    () =>
      Array.from(new Set((allFoods ?? []).map((item) => item.texture))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [allFoods],
  )
  const temperatures = useMemo(
    () =>
      Array.from(new Set((allFoods ?? []).map((item) => item.temperature))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [allFoods],
  )

  const queryArgs = useMemo(() => {
    const inStock = stockFilter === "all" ? undefined : stockFilter === "in" ? true : false
    return {
      includeUnsafe: true, // Show all in manager
      category: activeCategory || undefined,
      texture: activeTexture || undefined,
      temperature: activeTemperature || undefined,
      inStock,
    }
  }, [activeCategory, activeTemperature, activeTexture, stockFilter])

  const foods = useQuery(api.foods.listFoods, isConvexAuthenticated ? queryArgs : "skip")

  const sortedFoods = useMemo(() => {
    return [...(foods ?? [])].sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      if (sortMode === "category") return a.category.localeCompare(b.category)
      return b.updatedAt - a.updatedAt
    })
  }, [foods, sortMode])

  const onRefresh = async () => {
    if (!isConvexAuthenticated) return
    setIsRefreshing(true)
    try {
      await convex.query(api.foods.listFoods, queryArgs)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDelete = (id: Id<"foods">) => {
    Alert.alert("Delete food", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFood({ id })
          } catch {
            Alert.alert("Delete failed", "Unable to delete this food.")
          }
        },
      },
    ])
  }

  const handleStockToggle = async (id: Id<"foods">, inStock: boolean) => {
    try {
      if (inStock) {
        await markOutOfStock({ id })
      } else {
        await setInStock({ id, inStock: true })
      }
    } catch {
      Alert.alert("Update failed", "Unable to update stock status.")
    }
  }

  const resetFilters = () => {
    setStockFilter("all")
    setActiveCategory("")
    setActiveTexture("")
    setActiveTemperature("")
  }

  if (isConvexAuthLoading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
        <View style={themed($emptyState)}>
          <Text text="Loading..." />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <FlatList
        data={sortedFoods}
        keyExtractor={(item) => item._id}
        contentContainerStyle={themed($listContent)}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={themed($header)}>
            <View style={themed($actionsRow)}>
              <Button text="Add Food" onPress={() => router.push("/safe-foods/create")} />
            </View>

            <View style={themed($segmentRow)}>
              {(["all", "in", "out"] as const).map((item) => (
                <Pressable
                  key={item}
                  style={themed([$segmentButton, stockFilter === item && $segmentButtonActive])}
                  onPress={() => setStockFilter(item)}
                >
                  <Text
                    text={item === "all" ? "All" : item === "in" ? "In Stock" : "Out"}
                    style={themed([$segmentText, stockFilter === item && $segmentTextActive])}
                  />
                </Pressable>
              ))}
            </View>

            <View style={themed($chipGroup)}>
              {!!categories.length && (
                <>
                  <Text text="Category" style={themed($filterLabel)} />
                  <View style={themed($chipWrap)}>
                    {categories.map((item) => {
                      const isActive = item === activeCategory
                      return (
                        <Pressable
                          key={item}
                          style={themed([$chip, isActive && $chipActive])}
                          onPress={() => setActiveCategory(isActive ? "" : item)}
                        >
                          <Text
                            text={item}
                            style={themed([$chipText, isActive && $chipTextActive])}
                          />
                        </Pressable>
                      )
                    })}
                  </View>
                </>
              )}

              {!!textures.length && (
                <>
                  <Text text="Texture" style={themed($filterLabel)} />
                  <View style={themed($chipWrap)}>
                    {textures.map((item) => {
                      const isActive = item === activeTexture
                      return (
                        <Pressable
                          key={item}
                          style={themed([$chip, isActive && $chipActive])}
                          onPress={() => setActiveTexture(isActive ? "" : item)}
                        >
                          <Text
                            text={item}
                            style={themed([$chipText, isActive && $chipTextActive])}
                          />
                        </Pressable>
                      )
                    })}
                  </View>
                </>
              )}

              {!!temperatures.length && (
                <>
                  <Text text="Temperature" style={themed($filterLabel)} />
                  <View style={themed($chipWrap)}>
                    {temperatures.map((item) => {
                      const isActive = item === activeTemperature
                      return (
                        <Pressable
                          key={item}
                          style={themed([$chip, isActive && $chipActive])}
                          onPress={() => setActiveTemperature(isActive ? "" : item)}
                        >
                          <Text
                            text={item}
                            style={themed([$chipText, isActive && $chipTextActive])}
                          />
                        </Pressable>
                      )
                    })}
                  </View>
                </>
              )}
            </View>

            <View style={themed($metaRow)}>
              <Button text="Clear Filters" preset="reversed" onPress={resetFilters} />
              <Pressable
                accessibilityRole="button"
                style={themed($sortButton)}
                onPress={() =>
                  setSortMode((current) =>
                    current === "updated" ? "name" : current === "name" ? "category" : "updated",
                  )
                }
              >
                <Text text={`Sort: ${getLabel(sortMode)}`} style={themed($sortButtonText)} />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={themed($emptyState)}>
            <Text preset="subheading" text="No foods match these filters" />
            <Button text="Reset Filters" onPress={resetFilters} />
            <Button
              text="Add Food"
              preset="reversed"
              onPress={() => router.push("/safe-foods/create")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Card
            style={themed($card)}
            onPress={() => router.push(`/safe-foods/${item._id}`)}
            HeadingComponent={<Text preset="bold" text={item.name} />}
            ContentComponent={
              <View>
                {!!item.description && <Text text={item.description} selectable />}
                <Text text={`${item.category} / ${item.texture} / ${item.temperature}`} />
              </View>
            }
            FooterComponent={
              <View style={themed($cardFooter)}>
                <Text
                  text={`${item.isSafe ? "Safe" : "Unsafe"} / ${item.inStock ? "In Stock" : "Out of Stock"}`}
                />
                <View style={themed($cardActions)}>
                  <Button text="Edit" onPress={() => router.push(`/safe-foods/${item._id}/edit`)} />
                  <Button
                    text={item.inStock ? "Mark Out" : "Mark In"}
                    preset="reversed"
                    onPress={() => handleStockToggle(item._id, item.inStock)}
                  />
                  <Button text="Delete" onPress={() => handleDelete(item._id)} />
                </View>
              </View>
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
  gap: spacing.sm,
  marginBottom: spacing.md,
  paddingTop: 0,
})

const $actionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $segmentRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $segmentButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.separator,
  borderRadius: 10,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $segmentButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $segmentText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 12,
})

const $segmentTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $chipGroup: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xxs,
})

const $filterLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
})

const $chipWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $chip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.separator,
  borderRadius: 999,
  borderWidth: 1,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
})

const $chipActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
})

const $chipText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 11,
})

const $chipTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $metaRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.xs,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 12,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $cardActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.sm,
  paddingVertical: spacing.xl,
})
