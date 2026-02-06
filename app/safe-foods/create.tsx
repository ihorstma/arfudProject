import { useMemo, useState } from "react"
import { Pressable, ScrollView, Switch, TextStyle, View, ViewStyle } from "react-native"
import { Stack, useRouter } from "expo-router"
import { useMutation } from "convex/react"

import { Button } from "@/components/Button"
import { useCustomAlert } from "@/components/CustomAlert"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { api } from "@/convex/_generated/api"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { CATEGORY_OPTIONS, TEMPERATURE_OPTIONS, TEXTURE_OPTIONS } from "@/utils/foodFormOptions"

const parseTags = (value: string) => {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length ? tags : undefined
}

export default function SafeFoodsCreateScreen() {
  const router = useRouter()
  const { themed } = useAppTheme()
  const addFood = useMutation(api.foods.addFood)
  const { showAlert } = useCustomAlert()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [texture, setTexture] = useState("")
  const [temperature, setTemperature] = useState("")
  const [isSafe, setIsSafe] = useState(true)
  const [inStock, setInStock] = useState(true)
  const [imageUrl, setImageUrl] = useState("")
  const [tagsText, setTagsText] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const resetForm = () => {
    setName("")
    setDescription("")
    setCategory("")
    setTexture("")
    setTemperature("")
    setIsSafe(true)
    setInStock(true)
    setImageUrl("")
    setTagsText("")
    setSubmitted(false)
  }

  const validation = useMemo(
    () => ({
      name: !name.trim() ? "Name is required." : "",
      category: !category.trim() ? "Select or enter a category." : "",
      texture: !texture.trim() ? "Select or enter a texture." : "",
      temperature: !temperature.trim() ? "Select or enter a temperature." : "",
    }),
    [category, name, temperature, texture],
  )

  const hasError = Boolean(
    validation.name || validation.category || validation.texture || validation.temperature,
  )

  const handleSave = async () => {
    setSubmitted(true)
    if (hasError) return

    setIsSaving(true)
    try {
      await addFood({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        texture: texture.trim(),
        temperature: temperature.trim(),
        isSafe,
        inStock,
        imageUrl: imageUrl.trim() || undefined,
        tags: parseTags(tagsText),
      })
      resetForm()
      router.replace("/safe-foods")
    } catch {
      showAlert("Save failed", "Unable to create food.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($screen)}
    >
      <Stack.Screen options={{ title: "Add Food", headerShown: true }} />
      <View style={themed($screen)}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={themed($content)}
          keyboardShouldPersistTaps="handled"
        >
          <View style={themed($section)}>
            <Text preset="subheading" text="Basics" />
            <TextField label="Name" value={name} onChangeText={setName} />
            {submitted && !!validation.name && (
              <Text text={validation.name} style={themed($errorText)} />
            )}
            <TextField
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={themed($section)}>
            <Text preset="subheading" text="Attributes" />

            <Text text="Category" style={themed($fieldLabel)} />
            <View style={themed($chipWrap)}>
              {CATEGORY_OPTIONS.map((item) => {
                const isActive = item === category
                return (
                  <Pressable
                    key={item}
                    style={themed([$chip, isActive && $chipActive])}
                    onPress={() => setCategory(item)}
                  >
                    <Text text={item} style={themed([$chipText, isActive && $chipTextActive])} />
                  </Pressable>
                )
              })}
            </View>
            <TextField label="Custom Category" value={category} onChangeText={setCategory} />
            {submitted && !!validation.category && (
              <Text text={validation.category} style={themed($errorText)} />
            )}

            <Text text="Texture" style={themed($fieldLabel)} />
            <View style={themed($chipWrap)}>
              {TEXTURE_OPTIONS.map((item) => {
                const isActive = item === texture
                return (
                  <Pressable
                    key={item}
                    style={themed([$chip, isActive && $chipActive])}
                    onPress={() => setTexture(item)}
                  >
                    <Text text={item} style={themed([$chipText, isActive && $chipTextActive])} />
                  </Pressable>
                )
              })}
            </View>
            <TextField label="Custom Texture" value={texture} onChangeText={setTexture} />
            {submitted && !!validation.texture && (
              <Text text={validation.texture} style={themed($errorText)} />
            )}

            <Text text="Temperature" style={themed($fieldLabel)} />
            <View style={themed($chipWrap)}>
              {TEMPERATURE_OPTIONS.map((item) => {
                const isActive = item === temperature
                return (
                  <Pressable
                    key={item}
                    style={themed([$chip, isActive && $chipActive])}
                    onPress={() => setTemperature(item)}
                  >
                    <Text text={item} style={themed([$chipText, isActive && $chipTextActive])} />
                  </Pressable>
                )
              })}
            </View>
            <TextField
              label="Custom Temperature"
              value={temperature}
              onChangeText={setTemperature}
            />
            {submitted && !!validation.temperature && (
              <Text text={validation.temperature} style={themed($errorText)} />
            )}
          </View>

          <View style={themed($section)}>
            <Text preset="subheading" text="Flags" />
            <View style={themed($toggleRow)}>
              <Text text="Safe Food" />
              <Switch value={isSafe} onValueChange={setIsSafe} />
            </View>
            <View style={themed($toggleRow)}>
              <Text text="In Stock" />
              <Switch value={inStock} onValueChange={setInStock} />
            </View>
          </View>

          <View style={themed($section)}>
            <Text preset="subheading" text="Optional" />
            <TextField
              label="Image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
            <TextField
              label="Tags (comma-separated)"
              value={tagsText}
              onChangeText={setTagsText}
              autoCapitalize="none"
            />
          </View>
        </ScrollView>

        <View style={themed($actionBar)}>
          <Button text="Cancel" preset="reversed" onPress={() => router.back()} />
          <Button text={isSaving ? "Saving..." : "Save"} onPress={handleSave} disabled={isSaving} />
        </View>
      </View>
    </Screen>
  )
}

const $screen: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
  paddingBottom: spacing.xxl,
})

const $section: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderColor: colors.separator,
  borderRadius: 16,
  borderWidth: 1,
  gap: spacing.xs,
  padding: spacing.md,
})

const $fieldLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})

const $chipWrap: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  marginBottom: spacing.xs,
})

const $chip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.separator,
  borderRadius: 999,
  borderWidth: 1,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
})

const $chipActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral900,
  borderColor: colors.palette.neutral900,
})

const $chipText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 12,
})

const $chipTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $toggleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: spacing.xxs,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  fontSize: 12,
})

const $actionBar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.separator,
  borderTopWidth: 1,
  flexDirection: "row",
  gap: spacing.sm,
  padding: spacing.md,
})
