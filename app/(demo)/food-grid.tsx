import { useMemo, useState } from "react"
import {
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Pressable,
} from "react-native"
import { useRouter } from "expo-router"
import { FlashList } from "@shopify/flash-list"
import { Searchbar } from "react-native-paper"
import { useQuery } from "convex/react"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

const getRandomHeight = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return 180 + (Math.abs(hash) % 140) // 180 to 320
}

export default function FoodGridScreen() {
  const router = useRouter()
  const { themed, theme } = useAppTheme()
  const [searchQuery, setSearchQuery] = useState("")

  const rawFoods = useQuery(api.foods.listFoods, { includeUnsafe: false }) ?? []

  const foods = useMemo(() => {
    return rawFoods.map((item: any) => ({
      ...item,
      height: getRandomHeight(item._id),
    }))
  }, [rawFoods])

  const filteredData = foods.filter((item: any) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderItem = ({ item }: { item: Doc<"foods"> & { height: number } }) => (
    <Pressable
      style={themed($itemContainer)}
      onPress={() => router.push(`/safe-foods/${item._id}`)}
    >
      <Image
        source={{ uri: item.imageUrl || "https://loremflickr.com/300/300/food" }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />
      <Text style={themed($label)}>{item.name}</Text>
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
        <View style={themed($headerRow)}>
          <Text preset="heading" text="Safe Foods" />
        </View>
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
      </View>

      <FlashList
        data={filteredData}
        numColumns={2}
        renderItem={renderItem}
        // @ts-ignore
        masonry
        optimizeItemArrangement
        // @ts-ignore
        estimatedItemSize={200}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
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
  paddingBottom: spacing.xxxs,
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

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  gap: spacing.sm,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: spacing.sm,
})

const $searchBar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  marginBottom: spacing.sm,
  elevation: 0,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  minHeight: 0,
})

const $fab: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: spacing.lg,
  right: spacing.lg,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.9)",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 4,
})