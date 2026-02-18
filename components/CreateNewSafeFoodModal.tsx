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
  { label: "sweet", color: "#F28FB0"},
  { label: "savory", color: "#A7C68B"},
  { label: "crunchy", color: "#FF9400"},
  { label: "firm", color: "#6BB9AD"}, 
  { label: "soft", color: "#FFB7C6"},
  { label: "chewy", color: "#EEC036"},
  { label: "creamy", color: "#F8E6D1", textColor: "#6A6767"}, // custom text color as the tag is too pale for white
  { label: "sticky", color: "#D16D8B"},
  { label: "dry", color: "#BFC5C2"},
  { label: "warm", color: "#DF7471"},
  { label: "hot", color: "#FF4B3E"},
  { label: "cool", color: "#4F7DA7"},
  { label: "cold", color: "#A5D8FF"},
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
          <TextField label="name" value={name} onChangeText={setName} containerStyle={themed($field)} />
          <TextField label="archive (true/false)" value={isSafeText} onChangeText={setIsSafeText} autoCapitalize="none" containerStyle={themed($field)} />
          <TextField label="in stock (true/false)" value={inStockText} onChangeText={setInStockText} autoCapitalize="none" containerStyle={themed($field)} />
          <TextField label="image erl" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" containerStyle={themed($field)} />

          {/* Tag Selector */}
          <Text text="sensory tags" preset="subheading" />
          <View style={themed($tagContainer)}>
            {availableTags.map(tag => {
              const active = selectedTags.includes(tag.label)
              const textColor = tag.textColor ?? "white"
              return (
                <Pressable 
                  key={tag.label} 
                  onPress={() => toggleTag(tag.label)}
                  style={themed($tag(active, tag.color))}
                >
                {/* add the +/- depending on if the tag is active or not */}
                  <View style={{ flexDirection: "row", alignItems: "center"}}>
                    <Text text={tag.label} style={{ color: textColor}} />
                    <Text text={active ? " -" : " +"} style={{ color: textColor}}/>
                  </View>
                </Pressable>
              )
            })}
          </View>

          {/* add new safe food button */}
          <View style={themed($actions)}>
            <Button text="add new safe food" onPress={handleSave} disabled={isSaving} />
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

const $tag = (active: boolean, color: string): ThemedStyle<ViewStyle> => ({ colors }) => ({ 
  paddingVertical: 6, 
  paddingHorizontal: 12, 
  borderRadius: 3, 
  backgroundColor: color, 
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.md,
})
