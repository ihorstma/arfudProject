import { useMemo, useState } from "react"
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react"
import { Searchbar } from "react-native-paper"
import { useAddFoodTrigger } from "./store/useAddFoodTrigger"
import { useEffect } from "react"

import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

import SafeFoodsCreateModal from "@/components/CreateNewSafeFoodModal"
import EditSafeFoodModal from "@/components/EditSafeFoodModal"

type StockFilter = "all" | "in stock" | "low stock" | "out of stock"
type SortMode = "updated" | "name"
type ViewMode = "grid" | "list"

type TopTab = "all" | "search" | "filter"

const getRandomHeight = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return 180 + (Math.abs(hash) % 140)
}

const getLabel = (mode: SortMode) => {
  if (mode === "name") return "A–Z"
  return "Recent"
}

export default function FoodGridScreen() {
  const router = useRouter()
  const convex = useConvex()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } =
    useConvexAuth()
  const { themed, theme } = useAppTheme()

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("updated")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFood, setEditingFood] = useState<Doc<"foods"> | null>(null)

  const deleteFood = useMutation(api.foods.deleteFood)
  const seedFoods = useMutation(api.foods.seedFoods)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)
  const [topTab, setTopTab] = useState<TopTab>("all")

  const rawFoods = useQuery(
  api.foods.listFoods,
  isConvexAuthenticated
    ? {
        includeUnsafe: true,
        inStock: stockFilter === "all" ? undefined : stockFilter,
      }
    : "skip",
)

  const trigger = useAddFoodTrigger((s) => s.trigger)
  const setTrigger = useAddFoodTrigger((s) => s.setTrigger)

  useEffect(() => {
    if (trigger) {
      setShowCreateModal(true)
      setTrigger(false)
    }
  }, [trigger])

  const foods = useMemo(() => {
    const withHeights = (rawFoods ?? []).map(item => ({
      ...item,
      height: getRandomHeight(item._id),
    }))

    const withSearch = withHeights.filter(item =>
      searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )

    return withSearch.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      return b.updatedAt - a.updatedAt
      })
    }, [rawFoods, searchQuery, sortMode])

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
        await setInStock({ id, inStock: "In Stock" })
      }
    } catch {
      Alert.alert("Update failed", "Unable to update stock status.")
    }
  }

  const renderGridItem = ({
    item,
  }: {
    item: Doc<"foods"> & { height: number }
  }) => (
    <Pressable
      accessibilityRole="button"
      style={themed($itemContainer)}
      onPress={() => {
        setEditingFood(item)}}
    >
      <Image
        source={{
          uri: item.imageUrl || "https://loremflickr.com/300/300/food",
        }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />
      <Text style={themed($label)} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={themed($metaLabel)} numberOfLines={1}>
        {item.inStock ? "In stock" : "Out of stock"}
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
            <Text
              text={item.description}
              selectable
              style={{ marginBottom: 4 }}
            />
          )}
          <Text
            text={`${item.isSafe ? "Safe" : "Unsafe"} · ${
              item.inStock ? "In stock" : "Out of stock"
            }`}
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
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={themed($deleteButton)}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={theme.colors.error}
              />
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

    {/* --- TOP TABS (All / Search / Filter) --- */}
    <View style={themed($topTabsRow)}>
      {(["all", "search", "filter"] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setTopTab(tab)}
          style={themed([
            $topTabButton,
            topTab === tab && $topTabButtonActive,
          ])}
        >
          <Text
            text={
              tab === "all"
                ? "All"
                : tab === "search"
                ? "Search"
                : "Filter"
            }
            style={themed([
              $topTabText,
              topTab === tab && $topTabTextActive,
            ])}
          />
        </TouchableOpacity>
      ))}
    </View>

    {/* --- HEADER CONTENT CHANGES BASED ON TAB --- */}
    <View style={themed($header)}>

      {/* SEARCH TAB → Searchbar only */}
      {topTab === "search" && (
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
            onPress={() =>
              setViewMode(viewMode === "grid" ? "list" : "grid")
            }
          >
            <MaterialCommunityIcons
              name={
                viewMode === "grid"
                  ? "format-list-bulleted"
                  : "view-grid-outline"
              }
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* FILTER TAB → Stock filters (prep + sensory later) */}
      {topTab === "filter" && (
        <View style={{ gap: 12 }}>

          {/* Stock filter */}
          <View style={themed($segmentRow)}>
            {(["all", "in stock", "low stock", "out of stock"] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={themed([
                  $segmentButton,
                  stockFilter === item && $segmentButtonActive,
                ])}
                onPress={() => setStockFilter(item)}
              >
                <Text
                  text={
                    item === "in stock"
                      ? "In Stock"
                      : item === "low stock"
                      ? "Low Stock"
                      : item === "out of stock"
                      ? "Out of Stock"
                      : "All"
                  }
                  style={themed([
                    $segmentText,
                    stockFilter === item && $segmentTextActive,
                  ])}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Prep filter goes here */}
          {/* Sensory filter goes here */}
        </View>
      )}

      {/* ALL TAB → No search, no filters */}
      {topTab === "all" && (
        <View style={themed($topRow)}>
          <TouchableOpacity
            style={themed($viewToggle)}
            onPress={() =>
              setViewMode(viewMode === "grid" ? "list" : "grid")
            }
          >
            <MaterialCommunityIcons
              name={
                viewMode === "grid"
                  ? "format-list-bulleted"
                  : "view-grid-outline"
              }
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      )}

    </View>

    {/* --- LIST CONTENT --- */}
    {isConvexAuthLoading || rawFoods === undefined ? (
      <View style={themed($skeletonGrid)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={index} style={themed($skeletonCard)} />
        ))}
      </View>
    ) : (
      <FlashList
        key={viewMode}
        data={foods}
        numColumns={viewMode === "grid" ? 2 : 1}
        renderItem={viewMode === "grid" ? (renderGridItem as any) : (renderListItem as any)}
        masonry={viewMode === "grid"}
        optimizeItemArrangement={viewMode === "grid"}
        estimatedItemSize={viewMode === "grid" ? 200 : 150}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={themed($emptyState)}>
            <Text preset="subheading" text="No foods found" />
            <Button
              text="Add Food"
              preset="reversed"
              onPress={() => setShowCreateModal(true)}
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

    {/* --- MODALS --- */}
    <SafeFoodsCreateModal
      visible={showCreateModal}
      onClose={() => setShowCreateModal(false)}
    />

    {editingFood && (
      <EditSafeFoodModal
        visible={!!editingFood}
        food={editingFood}
        onClose={() => setEditingFood(null)}
      />
    )}

  </Screen>
)

}

const $topTabsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
})

const $topTabButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  borderRadius: 12,
  backgroundColor: colors.palette.neutral200,
})

const $topTabButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $topTabText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
})

const $topTabTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})


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
