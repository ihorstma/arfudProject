// the create a new safe food modal

import { View, Modal, Pressable, ViewStyle, TextStyle} from "react-native"
import { useRouter } from "expo-router"
import { useMutation } from "convex/react"
import { useState } from "react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useCustomAlert } from "@/components/CustomAlert"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const availableTags = [
  "sweet",
  "savory",
  "crunchy",
  "firm",
  "soft",
  "chewy",
  "creamy",
  "sticky",
  "dry",
  "warm",
  "hot",
  "cool",
  "cold",
]

interface addFoodModalProps {
  visible: boolean 
  onClose: () => void
}

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (["true", "yes", "1"].includes(normalized)) return true
  if (["false", "no", "0"].includes(normalized)) return false
  return null
}

export default function SafeFoodsCreateModal({ visible, onClose } : addFoodModalProps) {
  const { themed } = useAppTheme()
  const addFood = useMutation(api.foods.addFood)
  const { showAlert } = useCustomAlert()

  const [name, setName] = useState("")
  const [isSafeText, setIsSafeText] = useState("true")
  const [inStockText, setInStockText] = useState("true")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev,tag]
    )
  }

  const resetForm = () => {
    setName("")
    setIsSafeText("true")
    setInStockText("true")
    setImageUrl("")
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Missing fields", "Name, category, texture, and temperature are required.")
      return
    }

    const parsedSafe = parseBoolean(isSafeText)
    const parsedInStock = parseBoolean(inStockText)

    if (parsedSafe === null || parsedInStock === null) {
      showAlert("Invalid values", "Use true/false for Safe and In Stock.")
      return
    }

    setIsSaving(true)
    try {
      await addFood({
        name: name.trim(),
        isSafe: parsedSafe,
        inStock: parsedInStock,
        imageUrl: imageUrl.trim() || undefined,
        tags: selectedTags,
      })
      resetForm()
      onClose()
    } catch (error) {
      showAlert("Save failed", "Unable to create food.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={themed($backdrop)}>
        <View style={themed($modal)}>
          
          {/* Header */}
          <View style={themed($header)}>
            <Text text="add new safe food" style={themed($headerTitle)} />
            <Pressable onPress={onClose} style={themed($closeIcon)}>
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </Pressable>
          </View>

          {/* Form Fields */}
          <TextField label="Name" value={name} onChangeText={setName} containerStyle={themed($field)} />
          <TextField label="Safe (true/false)" value={isSafeText} onChangeText={setIsSafeText} autoCapitalize="none" containerStyle={themed($field)} />
          <TextField label="In Stock (true/false)" value={inStockText} onChangeText={setInStockText} autoCapitalize="none" containerStyle={themed($field)} />
          <TextField label="Image URL" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" containerStyle={themed($field)} />

          {/* Tag Selector */}
          <Text text="sensory tags" preset="subheading" />
          <View style={themed($tagContainer)}>
            {availableTags.map(tag => {
              const active = selectedTags.includes(tag)
              return (
                <Pressable key={tag} onPress={() => toggleTag(tag)}
                  style={themed($tag(active))}
                >
                  <Text text={tag} />
                </Pressable>
              )
            })}
          </View>

          {/* Buttons */}
          <View style={themed($actions)}>
            <Button text="Save" onPress={handleSave} disabled={isSaving} />
            <Button text="Cancel" preset="reversed" onPress={onClose} />
          </View>

        </View>
      </View>
    </Modal>
  )
}

const $backdrop: ThemedStyle<ViewStyle> = () => ({ 
  flex: 1, 
  backgroundColor: "rgba(0,0,0,0.4)", 
  justifyContent: "center", 
  alignItems: "center", 
}) 

const $modal: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({ 
  width: "90%", 
  backgroundColor: colors.createNewFoodModalBackground, 
  paddingHorizontal: spacing.lg, 
  paddingBottom: spacing.lg,
  paddingTop: spacing.xs,
  borderRadius: 16, 
}) 

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({ 
  width: "100%", 
  alignItems: "center", 
  justifyContent: "center", 
  marginBottom: spacing.md, 
  position: "relative",
})

const $headerTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 26,
  color: "white",
  marginTop: 10,
  lineHeight: 32,
})

const $closeIcon: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  right: -4,
  top: 4,
  padding: 4,
})

const $field: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
  color: "white",
})

const $tagContainer: ThemedStyle<ViewStyle> = () => ({ 
  flexDirection: "row", 
  flexWrap: "wrap", 
  gap: 8, 
  marginVertical: 8, 
})

const $tag = (active: boolean): ThemedStyle<ViewStyle> => ({ colors, spacing }) => ({ 
  paddingVertical: 6, 
  paddingHorizontal: 12, 
  borderRadius: 20, 
  backgroundColor: active ? colors.tint : colors.palette.neutral200, 
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.md,
})
