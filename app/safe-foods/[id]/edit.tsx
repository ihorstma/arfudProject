import { useEffect, useState } from "react"
import { Alert, View, ViewStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (["true", "yes", "1"].includes(normalized)) return true
  if (["false", "no", "0"].includes(normalized)) return false
  return null
}

const parseTags = (value: string) => {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length ? tags : undefined
}

export default function SafeFoodsEditScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()

  const foodId = id as Id<"foods">
  const food = useQuery(api.foods.getFoodById, { id: foodId })
  const updateFood = useMutation(api.foods.updateFood)

  const [isInitialized, setIsInitialized] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [texture, setTexture] = useState("")
  const [temperature, setTemperature] = useState("")
  const [isSafeText, setIsSafeText] = useState("true")
  const [inStockText, setInStockText] = useState("true")
  const [imageUrl, setImageUrl] = useState("")
  const [tagsText, setTagsText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!food || isInitialized) return
    setName(food.name)
    setDescription(food.description ?? "")
    setCategory(food.category)
    setTexture(food.texture)
    setTemperature(food.temperature)
    setIsSafeText(food.isSafe ? "true" : "false")
    setInStockText(food.inStock ? "true" : "false")
    setImageUrl(food.imageUrl ?? "")
    setTagsText(food.tags?.join(", ") ?? "")
    setIsInitialized(true)
  }, [food, isInitialized])

  const handleSave = async () => {
    if (!name.trim() || !category.trim() || !texture.trim() || !temperature.trim()) {
      Alert.alert("Missing fields", "Name, category, texture, and temperature are required.")
      return
    }

    const parsedSafe = parseBoolean(isSafeText)
    const parsedInStock = parseBoolean(inStockText)

    if (parsedSafe === null || parsedInStock === null) {
      Alert.alert("Invalid values", "Use true/false for Safe and In Stock.")
      return
    }

    setIsSaving(true)
    try {
      await updateFood({
        id: foodId,
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        texture: texture.trim(),
        temperature: temperature.trim(),
        isSafe: parsedSafe,
        inStock: parsedInStock,
        imageUrl: imageUrl.trim() || undefined,
        tags: parseTags(tagsText),
      })
      router.navigate(`/safe-foods/${foodId}`)
    } catch (error) {
      Alert.alert("Save failed", "Unable to update food.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!food) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($content)}>
        <Text text="Loading..." />
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($content)}>
      <View style={themed($headerRow)}>
        <PressableIcon icon="back" onPress={() => router.navigate(`/safe-foods/${id}`)} />
        <Text preset="heading" text="Edit Food" />
      </View>

      <TextField label="Name" value={name} onChangeText={setName} containerStyle={themed($field)} />
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        containerStyle={themed($field)}
      />
      <TextField
        label="Category"
        value={category}
        onChangeText={setCategory}
        containerStyle={themed($field)}
      />
      <TextField
        label="Texture"
        value={texture}
        onChangeText={setTexture}
        containerStyle={themed($field)}
      />
      <TextField
        label="Temperature"
        value={temperature}
        onChangeText={setTemperature}
        containerStyle={themed($field)}
      />
      <TextField
        label="Safe (true/false)"
        value={isSafeText}
        onChangeText={setIsSafeText}
        autoCapitalize="none"
        containerStyle={themed($field)}
      />
      <TextField
        label="In Stock (true/false)"
        value={inStockText}
        onChangeText={setInStockText}
        autoCapitalize="none"
        containerStyle={themed($field)}
      />
      <TextField
        label="Image URL"
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
        containerStyle={themed($field)}
      />
      <TextField
        label="Tags (comma-separated)"
        value={tagsText}
        onChangeText={setTagsText}
        autoCapitalize="none"
        containerStyle={themed($field)}
      />

      <View style={themed($actions)}>
        <Button text="Save" onPress={handleSave} disabled={isSaving} />
        <Button text="Cancel" preset="reversed" onPress={() => router.navigate(`/safe-foods/${id}`)} />
      </View>
    </Screen>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  gap: spacing.sm,
})

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  marginBottom: spacing.sm,
})

const $field: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.md,
})
