import { useMemo, useState } from "react"
import { Alert, FlatList, View, ViewStyle, TextStyle } from "react-native"
import { useRouter } from "expo-router"
import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

type InStockFilter = "all" | "in" | "out"

export default function SafeFoodsListScreen() {
  const router = useRouter()
  const { themed } = useAppTheme()

  const [category, setCategory] = useState("")
  const [texture, setTexture] = useState("")
  const [temperature, setTemperature] = useState("")
  const [inStockFilter, setInStockFilter] = useState<InStockFilter>("all")

  const deleteFood = useMutation(api.foods.deleteFood)
  const setInStock = useMutation(api.foods.setInStock)
  const markOutOfStock = useMutation(api.foods.markOutOfStock)

  const queryArgs = useMemo(() => {
    const categoryValue = category.trim()
    const textureValue = texture.trim()
    const temperatureValue = temperature.trim()
    const inStock =
      inStockFilter === "all" ? undefined : inStockFilter === "in" ? true : false

    return {
      includeUnsafe: false,
      category: categoryValue || undefined,
      texture: textureValue || undefined,
      temperature: temperatureValue || undefined,
      inStock,
    }
  }, [category, inStockFilter, temperature, texture])

  const foods = useQuery(api.foods.listFoods, queryArgs) ?? []

  const handleDelete = (id: Id<"foods">) => {
    Alert.alert("Delete food", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteFood({ id })
        },
      },
    ])
  }

  const handleStockToggle = async (id: Id<"foods">, inStock: boolean) => {
    if (inStock) {
      await markOutOfStock({ id })
    } else {
      await setInStock({ id, inStock: true })
    }
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <FlatList
        data={foods}
        keyExtractor={(item) => item._id}
        contentContainerStyle={themed($listContent)}
        ListHeaderComponent={
          <View style={themed($header)}>
            <Text preset="heading" text="Safe Foods" />
            <View style={themed($actionsRow)}>
              <Button text="Back to Foods" preset="reversed" onPress={() => router.push("/food-grid")} />
              <Button text="Add Food" onPress={() => router.push("/safe-foods/create")} />
              <Button
                text="View All"
                preset="reversed"
                onPress={() => router.push("/safe-foods/all")}
              />
            </View>

            <View style={themed($filters)}>
              <TextField
                label="Category"
                value={category}
                onChangeText={setCategory}
                autoCapitalize="none"
                containerStyle={themed($field)}
              />
              <TextField
                label="Texture"
                value={texture}
                onChangeText={setTexture}
                autoCapitalize="none"
                containerStyle={themed($field)}
              />
              <TextField
                label="Temperature"
                value={temperature}
                onChangeText={setTemperature}
                autoCapitalize="none"
                containerStyle={themed($field)}
              />
              <View style={themed($filterButtons)}>
                <Button
                  text="All"
                  preset={inStockFilter === "all" ? "filled" : "default"}
                  onPress={() => setInStockFilter("all")}
                />
                <Button
                  text="In Stock"
                  preset={inStockFilter === "in" ? "filled" : "default"}
                  onPress={() => setInStockFilter("in")}
                />
                <Button
                  text="Out"
                  preset={inStockFilter === "out" ? "filled" : "default"}
                  onPress={() => setInStockFilter("out")}
                />
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={<Text text="No foods yet." style={themed($empty)} />}
        renderItem={({ item }) => (
          <Card
            style={themed($card)}
            onPress={() => router.push(`/safe-foods/${item._id}`)}
            HeadingComponent={<Text preset="bold" text={item.name} />}
            ContentComponent={
              <View>
                {!!item.description && <Text text={item.description} />}
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
  gap: spacing.md,
  marginBottom: spacing.md,
})

const $actionsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
})

const $filters: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $field: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $filterButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  flexWrap: "wrap",
})

const $card: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $cardFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $cardActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  flexWrap: "wrap",
})

const $empty: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})
