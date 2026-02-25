import { useMemo, useState } from "react"
import {
  Alert,
  Image,
  ImageStyle,
  Pressable,
  RefreshControl,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react"
import { Searchbar } from "react-native-paper"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

type StockFilter = "all" | "in" | "out"
type SortMode = "updated" | "name" | "category"
type ViewMode = "grid" | "list"

const getRandomHeight = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return 180 + (Math.abs(hash) % 140)
}

const getLabel = (mode: SortMode) => {
  if (mode === "name") return "A-Z"
  if (mode === "category") return "Category"
  return "Recent"
}

export default function FoodGridScreen() {
  const router = useRouter()
  const convex = useConvex()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth()
  const { themed, theme } = useAppTheme()

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("updated")
  const [activeCategory, setActiveCategory] = useState("")
  const [activeTexture, setActiveTexture] = useState("")
  const [activeTemperature, setActiveTemperature] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const deleteFood = useMutation(api.foods.deleteFood)
  const seedFoods = useMutation(api.foods.seedFoods)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)

  const rawFoods = useQuery(
    api.foods.listFoods,
    isConvexAuthenticated ? { includeUnsafe: true } : "skip",
  )

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const item of rawFoods ?? []) if (item.category) set.add(item.category)
    return Array.from(set).sort()
  }, [rawFoods])

  const textures = useMemo(() => {
    const set = new Set<string>()
    for (const item of rawFoods ?? []) if (item.texture) set.add(item.texture)
    return Array.from(set).sort()
  }, [rawFoods])

  const temperatures = useMemo(() => {
    const set = new Set<string>()
    for (const item of rawFoods ?? []) if (item.temperature) set.add(item.temperature)
    return Array.from(set).sort()
  }, [rawFoods])

  const foods = useMemo(() => {
    const withHeights = (rawFoods ?? []).map((item: Doc<"foods">) => ({
      ...item,
      height: getRandomHeight(item._id),
    }))

    const withFilters = withHeights.filter((item) => {
      if (stockFilter === "in" && !item.inStock) return false
      if (stockFilter === "out" && item.inStock) return false
      if (activeCategory && item.category !== activeCategory) return false
      if (activeTexture && item.texture !== activeTexture) return false
      if (activeTemperature && item.temperature !== activeTemperature) return false
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })

    return withFilters.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      if (sortMode === "category") return a.category.localeCompare(b.category)
      return b.updatedAt - a.updatedAt
    })
  }, [
    activeCategory,
    activeTemperature,
    activeTexture,
    rawFoods,
    searchQuery,
    sortMode,
    stockFilter,
  ])

  const onRefresh = async () => {
    if (!isConvexAuthenticated) return
    setIsRefreshing(true)
    try {
      await convex.query(api.foods.listFoods, { includeUnsafe: true })
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

  const renderGridItem = ({ item }: { item: Doc<"foods"> & { height: number } }) => (
    <Pressable
      accessibilityRole="button"
      style={themed($itemContainer)}
      onPress={() => router.push(`/safe-foods/${item._id}`)}
    >
      <Image
        source={{ uri: item.imageUrl || "https://loremflickr.com/300/300/food" }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />
      <Text style={themed($label)} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={themed($metaLabel)} numberOfLines={1}>
        {item.category} / {item.inStock ? "In Stock" : "Out"}
      </Text>
    </Pressable>
  )

  const renderListItem = ({ item }: { item: Doc<"foods"> }) => (
    <Card
      style={themed($card)}
      onPress={() => router.push(`/safe-foods/${item._id}`)}
      HeadingComponent={<Text preset="bold" text={item.name} />}
      ContentComponent={
        <View>
          {!!item.description && (
            <Text text={item.description} selectable style={{ marginBottom: 4 }} />
          )}
          <Text
            text={`${item.category} • ${item.texture} • ${item.temperature}`}
            style={themed($metaLabel)}
          />
        </View>
      }
      FooterComponent={
        <View style={themed($cardFooter)}>
          <View style={themed($cardActions)}>
            <Button
              text="Edit"
              preset="reversed"
              style={{ flex: 1 }}
              onPress={() => router.push(`/safe-foods/${item._id}/edit`)}
            />
            <Button
              text={item.inStock ? "Mark Out" : "Mark In"}
              style={{ flex: 1.5 }}
              onPress={() => handleStockToggle(item._id, item.inStock)}
            />
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={themed($deleteButton)}>
              <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      }
    />
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={$styles.flex1}
      style={{ backgroundColor: theme.colors.palette.neutral100 }}
    >
      <View style={themed($header)}>
        <View style={themed($topRow)}>
          <Searchbar
            placeholder="Search foods"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={themed($searchBar)}
            inputStyle={themed($searchInput)}
            iconColor={theme.colors.palette.neutral500}
            placeholderTextColor={theme.colors.palette.neutral500}
            elevation={0}
          />
          <TouchableOpacity
            style={themed($viewToggle)}
            onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            <MaterialCommunityIcons
              name={viewMode === "grid" ? "format-list-bulleted" : "view-grid-outline"}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={themed($segmentRow)}>
          {(["all", "in", "out"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              style={themed([$segmentButton, stockFilter === item && $segmentButtonActive])}
              onPress={() => setStockFilter(item)}
            >
              <Text
                text={item === "all" ? "All" : item === "in" ? "In Stock" : "Out"}
                style={themed([$segmentText, stockFilter === item && $segmentTextActive])}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={themed($chipGroup)}>
          <FlashList
            horizontal
            data={categories}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `cat-${item}`}
            contentContainerStyle={themed($chipList)}
            renderItem={({ item }) => {
              const isActive = item === activeCategory
              return (
                <Pressable
                  style={themed([$chip, isActive && $chipActive])}
                  onPress={() => setActiveCategory(isActive ? "" : item)}
                >
                  <Text text={item} style={themed([$chipText, isActive && $chipTextActive])} />
                </Pressable>
              )
            }}
          />
          <FlashList
            horizontal
            data={textures}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `tex-${item}`}
            contentContainerStyle={themed($chipList)}
            renderItem={({ item }) => {
              const isActive = item === activeTexture
              return (
                <Pressable
                  style={themed([$chip, isActive && $chipActive])}
                  onPress={() => setActiveTexture(isActive ? "" : item)}
                >
                  <Text text={item} style={themed([$chipText, isActive && $chipTextActive])} />
                </Pressable>
              )
            }}
          />
        </View>

        <View style={themed($sortRow)}>
          <TouchableOpacity
            onPress={() =>
              setSortMode((current) =>
                current === "updated" ? "name" : current === "name" ? "category" : "updated",
              )
            }
            style={themed($sortButton)}
          >
            <Text text={`Sort: ${getLabel(sortMode)}`} style={themed($sortButtonText)} />
          </TouchableOpacity>
          <Button
            text="Clear"
            preset="reversed"
            style={{ minHeight: 0, paddingVertical: 4 }}
            onPress={() => {
              setActiveCategory("")
              setActiveTexture("")
              setActiveTemperature("")
              setSearchQuery("")
              setStockFilter("all")
            }}
          />
        </View>
      </View>

      {isConvexAuthLoading || rawFoods === undefined ? (
        <View style={themed($skeletonGrid)}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={themed($skeletonCard)} />
          ))}
        </View>
      ) : (
        <FlashList
          key={viewMode} // Force re-render when switching layouts
          data={foods}
          numColumns={viewMode === "grid" ? 2 : 1}
          renderItem={viewMode === "grid" ? (renderGridItem as any) : (renderListItem as any)}
          // @ts-ignore
          masonry={viewMode === "grid"}
          optimizeItemArrangement={viewMode === "grid"}
          estimatedItemSize={viewMode === "grid" ? 200 : 150}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={themed($emptyState)}>
              <Text preset="subheading" text="No foods found" />
              <Button
                text="Add Food"
                preset="reversed"
                onPress={() => router.push("/safe-foods/create")}
              />
              <Button
                text="Seed Test Data"
                onPress={async () => {
                  setIsRefreshing(true)
                  try {
                    await seedFoods()
                  } finally {
                    setIsRefreshing(false)
                  }
                }}
              />
            </View>
          }
        />
      )}

      <TouchableOpacity style={themed($fab)} onPress={() => router.push("/safe-foods/create")}>
        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.palette.neutral900} />
      </TouchableOpacity>
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.xxxs + 80,
})

const $itemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
  marginBottom: spacing.xxxs,
})

const $image: ThemedStyle<ImageStyle> = ({ colors, spacing }) => ({
  borderRadius: 16,
  backgroundColor: colors.palette.neutral300,
  width: "100%",
  marginBottom: spacing.xs,
})

const $label: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 14,
})

const $metaLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xs,
  gap: spacing.xs,
})

const $topRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  flex: 1,
  minHeight: 40,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  minHeight: 0,
  fontSize: 14,
})

const $viewToggle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.xs,
})

const $segmentRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $segmentButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.palette.neutral400,
  borderRadius: 10,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: 4,
})

const $segmentButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $segmentText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 11,
})

const $segmentTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $chipGroup: ThemedStyle<ViewStyle> = () => ({
  gap: 2,
})

const $chipList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: 2,
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
  fontSize: 10,
})

const $chipTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $sortRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
})

const $sortButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: 4,
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 12,
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  marginHorizontal: spacing.xs,
})

const $cardFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $cardActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $deleteButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $skeletonGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  justifyContent: "space-between",
  padding: spacing.md,
})

const $skeletonCard: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  height: 180,
  width: "48%",
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.xl,
})

const $fab: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 28,
  bottom: spacing.lg,
  elevation: 4,
  height: 56,
  justifyContent: "center",
  position: "absolute",
  right: spacing.lg,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  width: 56,
})
