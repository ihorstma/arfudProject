import { useMemo, useState } from "react"
import {
  Image,
  ImageStyle,
  Pressable,
  RefreshControl,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Stack, useRouter } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useConvex, useConvexAuth, useQuery } from "convex/react"
import { Searchbar } from "react-native-paper"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

type StockFilter = "all" | "in" | "out"
type SortMode = "updated" | "name" | "category"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("updated")
  const [activeCategory, setActiveCategory] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const rawFoods = useQuery(
    api.foods.listFoods,
    isConvexAuthenticated ? { includeUnsafe: false } : "skip",
  )

  const categories = useMemo(() => {
    const map = new Set<string>()
    for (const item of rawFoods ?? []) {
      if (item.category) map.add(item.category)
    }
    return Array.from(map).sort((a, b) => a.localeCompare(b))
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
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })

    return withFilters.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      if (sortMode === "category") return a.category.localeCompare(b.category)
      return b.updatedAt - a.updatedAt
    })
  }, [activeCategory, rawFoods, searchQuery, sortMode, stockFilter])

  const onRefresh = async () => {
    if (!isConvexAuthenticated) return
    setIsRefreshing(true)
    try {
      await convex.query(api.foods.listFoods, { includeUnsafe: false })
    } finally {
      setIsRefreshing(false)
    }
  }

  const renderItem = ({ item }: { item: Doc<"foods"> & { height: number } }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.name}`}
      style={themed($itemContainer)}
      onPress={() => router.push(`/safe-foods/${item._id}`)}
    >
      <Image
        source={{ uri: item.imageUrl || "https://loremflickr.com/300/300/food" }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />
      <Text style={themed($label)}>{item.name}</Text>
      <Text style={themed($metaLabel)}>
        {item.category} / {item.inStock ? "In Stock" : "Out"}
      </Text>
    </Pressable>
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={$styles.flex1}
      style={{ backgroundColor: theme.colors.palette.neutral100 }}
    >
      <View style={themed($header)}>
        <Searchbar
          placeholder="Search safe foods"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={themed($searchBar)}
          inputStyle={themed($searchInput)}
          iconColor={theme.colors.palette.neutral500}
          placeholderTextColor={theme.colors.palette.neutral500}
          elevation={0}
        />

        <View style={themed($segmentRow)}>
          {(["all", "in", "out"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${item}`}
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

        {!!categories.length && (
          <FlashList
            horizontal
            data={categories}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
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
        )}

        <View style={themed($sortRow)}>
          <Text text="Sort" style={themed($sortLabel)} />
          <TouchableOpacity
            onPress={() =>
              setSortMode((current) =>
                current === "updated" ? "name" : current === "name" ? "category" : "updated",
              )
            }
            style={themed($sortButton)}
          >
            <Text text={getLabel(sortMode)} style={themed($sortButtonText)} />
          </TouchableOpacity>
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
          data={foods}
          numColumns={2}
          renderItem={renderItem}
          // @ts-ignore
          masonry
          optimizeItemArrangement
          // @ts-ignore
          estimatedItemSize={200}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={themed($emptyState)}>
              <Text preset="subheading" text="No foods match these filters" />
              <Button
                text="Clear Filters"
                onPress={() => {
                  setActiveCategory("")
                  setSearchQuery("")
                  setStockFilter("all")
                }}
              />
              <Button
                text="Add First Food"
                preset="reversed"
                onPress={() => router.push("/safe-foods/create")}
              />
            </View>
          }
        />
      )}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Add food"
        style={themed($fab)}
        onPress={() => router.push("/safe-foods/create")}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color={theme.colors.palette.neutral900} />
      </TouchableOpacity>
    </Screen>
  )
}

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingBottom: spacing.xxxs + 72,
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
  lineHeight: 20,
})

const $metaLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 12,
  lineHeight: 18,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: 0,
  gap: spacing.xs,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  elevation: 0,
  minHeight: 36,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  minHeight: 0,
  fontSize: 14,
})

const $segmentRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
})

const $segmentButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.palette.neutral400,
  borderRadius: 10,
  borderWidth: 1,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
})

const $segmentButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $segmentText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 11,
})

const $segmentTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $chipList: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxxs,
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

const $sortRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "flex-end",
})

const $sortLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 12,
})

const $sortButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $sortButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 12,
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
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  borderColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: 28,
  borderWidth: 1,
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
