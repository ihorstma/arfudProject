import { FC, useState } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Searchbar } from "react-native-paper"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { DemoTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

interface FoodItem {
  id: string
  label: string
  height: number
  image: string
}

const FOOD_ITEMS: FoodItem[] = [
  {
    id: "1",
    label: "Frozen Watermelon",
    height: 220,
    image: "https://loremflickr.com/300/220/watermelon",
  },
  {
    id: "2",
    label: "Prosciutto",
    height: 300,
    image: "https://loremflickr.com/300/300/prosciutto",
  },
  {
    id: "3",
    label: "Avocado Toast",
    height: 200,
    image: "https://loremflickr.com/300/200/avocado",
  },
  {
    id: "4",
    label: "Blueberry Smoothie",
    height: 260,
    image: "https://loremflickr.com/300/260/smoothie",
  },
  {
    id: "5",
    label: "Grilled Salmon",
    height: 240,
    image: "https://loremflickr.com/300/240/salmon",
  },
  { id: "6", label: "Caesar Salad", height: 180, image: "https://loremflickr.com/300/180/salad" },
  { id: "7", label: "Chocolate Cake", height: 280, image: "https://loremflickr.com/300/280/cake" },
  { id: "8", label: "Iced Coffee", height: 320, image: "https://loremflickr.com/300/320/coffee" },
  { id: "9", label: "Sushi Platter", height: 210, image: "https://loremflickr.com/300/210/sushi" },
  { id: "10", label: "Mango Salsa", height: 190, image: "https://loremflickr.com/300/190/mango" },
]

export const FoodGridScreen: FC<DemoTabScreenProps<"FoodGrid">> = function FoodGridScreen(_props) {
  const { themed, theme } = useAppTheme()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredData = FOOD_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderItem = ({ item }: { item: FoodItem }) => (
    <View style={themed($itemContainer)}>
      <Image
        source={{ uri: item.image }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />
      <Text style={themed($label)}>{item.label}</Text>
    </View>
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      contentContainerStyle={$styles.flex1}
      style={{ backgroundColor: theme.colors.palette.neutral100 }}
    >
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
      <FlashList
        data={filteredData}
        numColumns={2}
        renderItem={renderItem}
        masonry
        optimizeItemArrangement
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
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

const $searchBar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  margin: spacing.md,
  elevation: 0,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  minHeight: 0, // Fix for some paper versions with height issues
})
