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
import { RecipeModal } from "@/components/RecipeModal"
import { FoodCard } from "@/components/FoodCard"
import { availableTags, prepTimeTags, stockTags } from "@/components/FoodTagsInfo/FoodTags"
import { TagPill } from "@/components/FoodTagsInfo/TagPill"

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

  const [stockFilter, setStockFilter] = useState<string[]>([])
  const [prepFilter, setPrepFilter] = useState<string[]>([])
  const [sensoryFilter, setSensoryFilter] = useState<string[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("updated")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFood, setEditingFood] = useState<Doc<"foods"> | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<Doc<"foods"> | null>(null)

  const deleteFood = useMutation(api.foods.deleteFood)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)
  const [topTab, setTopTab] = useState<TopTab>("all")

  const rawFoods = useQuery(
  api.foods.listFoods,
  isConvexAuthenticated
    ? {
        includeUnsafe: true,
        inStock: undefined, // you’re filtering client-side now
        search: topTab === "search" ? searchQuery : undefined,
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
    let list = (rawFoods ?? []).map(item => ({
      ...item,
      height: getRandomHeight(item._id),
    }))

    // --- FILTER TAB: Stock ---
    if (topTab === "filter" && stockFilter.length > 0) {
      list = list.filter(item => 
        stockFilter.includes(item.inStock ?? "")
    )}

    // --- FILTER TAB: Prep ---
    if (topTab === "filter" && prepFilter.length > 0) {
      list = list.filter(item =>
        item.prepTime?.some((tag) => prepFilter.includes(tag))
    )}

    // --- FILTER TAB: Sensory (multi-select)
    if (topTab === "filter" && sensoryFilter.length > 0) {
      list = list.filter(item =>
        item.tags?.some((tag) => sensoryFilter.includes(tag))
    )}

    // --- SORTING ---
    return list.sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name)
      return b.updatedAt - a.updatedAt
    })
  }, [rawFoods, topTab, searchQuery, stockFilter, prepFilter, sensoryFilter, sortMode])


  const onRefresh = async () => {
    if (!isConvexAuthenticated) return
    setIsRefreshing(true)
    try {
      await convex.query(api.foods.listFoods, { includeUnsafe: true })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
  <Screen
    preset="fixed"
    safeAreaEdges={["top"]}
    contentContainerStyle={$styles.flex1}
    style={{ backgroundColor: theme.colors.palette.neutral100 }}
  >

    {/* --- TOP TABS (All / Search / Filter) --- */}
    <View style={themed($topTabsRow)}>
      {(["all", "search", "filter"] as const).map((tab) => {
        const active = topTab === tab
        
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setTopTab(tab)}
            style={themed($topTabTouchable)}
          >
            <Text
              text={
                tab === "all"
                  ? "all"
                  : tab === "search"
                  ? "search"
                  : "filter"
              }
              style={themed($topTabTextNew(active))}
            />
            {active && <View style={themed($topTabUnderline)} />}
          </TouchableOpacity>
          )
      })}
    </View>

    {/* --- HEADER CONTENT CHANGES BASED ON TAB --- */}
    <View style={themed($header)}>

      {/* SEARCH TAB → Searchbar only */}
      {topTab === "search" && (
        <View style={themed($searchContainer)}>
          <Searchbar
            placeholder="search your safe foods"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={themed($searchBar)}
            inputStyle={themed($searchInput)}
            iconColor={"#6A6A6A"}
            placeholderTextColor={"#6A6A6A"}
            elevation={0}
          />
        </View>
      )}

      {/* FILTER TAB -> stock, prep, sensory later) */}
      {topTab === "filter" && (
        <View style={{ gap: 12 }}>

          {/* Stock Filter */}
          <View style={[themed($segmentRow), { flexWrap: "wrap" }]}>
            {stockTags.map(tag => {
              const active = stockFilter.includes(tag.label)
    
              return (
                <TagPill
                  key={tag.label}
                  label={tag.label}
                  color={tag.color}
                  textColor={tag.textColor}
                  active={active}
                  onPress={() =>
                    setStockFilter(prev =>
                      active ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                    )
                  }
                />
              )
            })}
          </View>

          {/* Prep Time Filter */}
          <View style={[themed($segmentRow), { flexWrap: "wrap" }]}>
            {prepTimeTags.map(tag => {
              const active = prepFilter.includes(tag.label)
    
              return (
                <TagPill
                  key={tag.label}
                  label={tag.label}
                  color={tag.color}
                  textColor={tag.textColor}
                  active={active}
                  onPress={() =>
                    setPrepFilter(prev =>
                      active ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                    )
                  }
                />
              )
            })}
          </View>

          {/* Sensory Tags Filter */}
          <View style={[themed($segmentRow), { flexWrap: "wrap" }]}>
            {availableTags.map(tag => {
              const active = sensoryFilter.includes(tag.label)
    
              return (
                <TagPill
                  key={tag.label}
                  label={tag.label}
                  color={tag.color}
                  textColor={tag.textColor}
                  active={active}
                  onPress={() =>
                    setSensoryFilter(prev =>
                      active ? prev.filter(t => t !== tag.label) : [...prev, tag.label]
                    )
                  }
                />
              )
            })}
          </View>

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
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            onEdit={(food) => setEditingFood(food)}
            themed={themed}
            $itemContainer={$itemContainer}
            $image={$image}
            $label={$label}
            $metaLabel={$metaLabel}
            onViewRecipe={(food) => setViewingRecipe(food)}
          />
        )}
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

    {viewingRecipe && (
      <RecipeModal
        visible={true}
        initialRecipe={viewingRecipe.recipes?.[0]}
        onClose={() => setViewingRecipe(null)}
        onSave={() => {}}
        readOnly={true}
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

const $topTabTouchable: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xs,
  alignItems: "center",
})

const $topTabTextNew = (active: boolean): ThemedStyle<TextStyle> =>
  ({ colors, typography }) => ({
    fontFamily: typography.primary.medium,
    fontSize: 16,
    color: colors.text, // black
    opacity: active ? 1 : 0.5,
  })

const $topTabUnderline: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 2,
  width: "100%",
  backgroundColor: colors.text, // black underline
  marginTop: 2,
  borderRadius: 1,
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

const $searchContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  paddingHorizontal: spacing.sm,
  marginBottom: spacing.xs,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "transparent",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  height: 40,
  justifyContent: "center",
  paddingVertical: 0,
  width: "100%",
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  paddingTop: 0,
  paddingBottom: 17,
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
