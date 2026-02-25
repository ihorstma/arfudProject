import { useMemo, useState } from "react"
import {
  FlatList,
  Pressable,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import { useRouter } from "expo-router"

import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

type SortBy = "category" | "alphabetical" | "date" | "safe" | "unchecked"

const CATEGORY_COLORS: Record<string, string> = {
  "bakery & bread": "#FDB022",
  dairy: "#53B1FD",
  produce: "#A6D71C",
  meat: "#F6708E",
  other: "#98A2B3",
}

export default function GroceryListScreen() {
  const { themed, theme } = useAppTheme()
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()
  const [sortBy, setSortBy] = useState<SortBy>("category")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const groceries = useQuery(api.groceries.listGroceries, isAuthenticated ? { sortBy } : "skip")
  const toggleItem = useMutation(api.groceries.toggleItem)
  const clearCompleted = useMutation(api.groceries.clearCompleted)
  const clearAll = useMutation(api.groceries.clearAll)
  const seedGroceries = useMutation(api.groceries.seedGroceries)

  const groupedGroceries = useMemo(() => {
    if (!groceries) return []
    const groups: Record<string, Doc<"groceryItems">[]> = {}
    groceries.forEach((item) => {
      const cat = item.category.toLowerCase()
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    return Object.entries(groups).map(([name, items]) => ({ name, items }))
  }, [groceries])

  const renderItem = (item: Doc<"groceryItems">) => (
    <View key={item._id} style={themed($itemRow)}>
      <View style={[themed($categoryBar), { backgroundColor: CATEGORY_COLORS[item.category.toLowerCase()] || CATEGORY_COLORS.other }]} />
      <TouchableOpacity 
        style={themed($checkbox)} 
        onPress={() => toggleItem({ id: item._id })}
      >
        <MaterialCommunityIcons 
          name={item.isCompleted ? "checkbox-marked-circle-outline" : "circle-outline"} 
          size={24} 
          color={theme.colors.palette.neutral900} 
        />
      </TouchableOpacity>
      <View style={themed($itemContent)}>
        <Text 
          text={item.name} 
          style={themed([$itemName, item.isCompleted && $itemCompleted])} 
        />
        {item.quantity && (
          <View style={themed($quantityBadge)}>
            <Text text={item.quantity} style={themed($quantityText)} />
          </View>
        )}
      </View>
      <TouchableOpacity style={themed($notesButton)}>
        <MaterialCommunityIcons name="file-document-edit-outline" size={20} color={theme.colors.palette.neutral900} />
      </TouchableOpacity>
    </View>
  )

  const SideMenu = () => (
    <View style={themed($menuOverlay)}>
      <Pressable style={$styles.flex1} onPress={() => setIsMenuOpen(false)} />
      <View style={themed($menuContent)}>
        <Text text="sort by" style={themed($menuTitle)} />
        {(["category", "alphabetical", "date", "safe", "unchecked"] as SortBy[]).map((option) => (
          <TouchableOpacity 
            key={option} 
            onPress={() => { setSortBy(option); setIsMenuOpen(false); }}
            style={themed($menuOption)}
          >
            <Text 
              text={option === "date" ? "date added" : option === "safe" ? "safe foods" : option === "unchecked" ? "unchecked first" : option} 
              style={themed([$menuOptionText, sortBy === option && $menuOptionActive])} 
            />
          </TouchableOpacity>
        ))}
        
        <View style={themed($menuDivider)} />
        
        <TouchableOpacity style={themed($menuOption)} onPress={() => { clearCompleted(); setIsMenuOpen(false); }}>
          <Text text="clear completed" style={themed($menuOptionText)} />
        </TouchableOpacity>
        <TouchableOpacity style={themed($menuOption)} onPress={() => { clearAll(); setIsMenuOpen(false); }}>
          <Text text="clear all" style={themed($menuOptionText)} />
        </TouchableOpacity>
        <TouchableOpacity style={themed($menuOption)}>
          <Text text="export list" style={themed($menuOptionText)} />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      style={{ backgroundColor: "#F9F9F9" }}
      contentContainerStyle={$styles.flex1}
    >
      <View style={themed($header)}>
        <TouchableOpacity style={themed($addButton)}>
          <MaterialCommunityIcons name="plus-circle" size={40} color="#53B1FD" />
        </TouchableOpacity>
        <Text text="grocery list" style={themed($title)} />
        <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
          <MaterialCommunityIcons name="menu" size={32} color={theme.colors.palette.neutral900} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={themed($fruitIcons)}>
        {["apple", "orange", "mango", "water-off"].map((icon, i) => (
           <MaterialCommunityIcons key={i} name={icon as any} size={48} color={["#A6D71C", "#FDB022", "#F6708E", "#7F56D9"][i]} style={{ marginRight: 20 }} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={themed($listContent)}>
        {groupedGroceries.length > 0 ? (
          groupedGroceries.map((group) => (
            <View key={group.name} style={themed($section)}>
              <View style={themed($sectionHeader)}>
                 <MaterialCommunityIcons 
                    name={group.name === "dairy" ? "cup" : group.name === "produce" ? "leaf" : group.name === "meat" ? "food-steak" : "bread-slice"} 
                    size={20} 
                    color={CATEGORY_COLORS[group.name] || CATEGORY_COLORS.other} 
                  />
                 <Text text={group.name} style={[themed($sectionTitle), { color: CATEGORY_COLORS[group.name] || CATEGORY_COLORS.other }]} />
                 <MaterialCommunityIcons name="chevron-up" size={20} color={theme.colors.palette.neutral500} />
              </View>
              {group.items.map(renderItem)}
            </View>
          ))
        ) : (
          <View style={themed($emptyState)}>
            <Text text="Your list is empty" style={themed($emptyText)} />
            <Button text="Seed Mock Data" onPress={() => seedGroceries()} />
          </View>
        )}
      </ScrollView>

      {isMenuOpen && <SideMenu />}
    </Screen>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $addButton: ThemedStyle<ViewStyle> = () => ({
  shadowColor: "#53B1FD",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
})

const $title: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 28,
  fontFamily: typography.primary.medium,
  color: "#344054",
})

const $fruitIcons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  alignItems: "center",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: 100,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
  gap: spacing.xs,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 20,
  fontFamily: typography.primary.medium,
  flex: 1,
})

const $itemRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "white",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  marginBottom: 2,
  borderRadius: 8,
})

const $categoryBar: ThemedStyle<ViewStyle> = () => ({
  width: 4,
  height: "80%",
  borderRadius: 2,
  marginRight: 12,
})

const $checkbox: ThemedStyle<ViewStyle> = () => ({
  marginRight: 12,
})

const $itemContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
})

const $itemName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
})

const $itemCompleted: ThemedStyle<TextStyle> = ({ colors }) => ({
  textDecorationLine: "line-through",
  color: colors.textDim,
})

const $quantityBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
})

const $quantityText: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
  color: "#667085",
})

const $notesButton: ThemedStyle<ViewStyle> = () => ({
  padding: 4,
})

const $menuOverlay: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.1)",
  flexDirection: "row",
})

const $menuContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "70%",
  backgroundColor: "#F9F9F9",
  paddingTop: 60,
  paddingHorizontal: spacing.lg,
  borderLeftWidth: 1,
  borderLeftColor: "#EAECF0",
})

const $menuTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.medium,
  marginBottom: 20,
  color: "#344054",
})

const $menuOption: ThemedStyle<ViewStyle> = () => ({
  paddingVertical: 12,
})

const $menuOptionText: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
  color: "#344054",
})

const $menuOptionActive: ThemedStyle<TextStyle> = () => ({
  color: "#53B1FD",
  fontWeight: "bold",
})

const $menuDivider: ThemedStyle<ViewStyle> = () => ({
  height: 1,
  backgroundColor: "#EAECF0",
  marginVertical: 20,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xl,
  alignItems: "center",
  gap: spacing.md,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
})
