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
import * as ImagePicker from "expo-image-picker"
import { Image } from "react-native"

const availableTags = [
  { label: "sweet", color: "#F28FB0"},
  { label: "savory", color: "#A7C68B"},
  { label: "crunchy", color: "#FF9400"},
  { label: "firm", color: "#6BB9AD"}, 
  { label: "soft", color: "#FFB7C6"},
  { label: "chewy", color: "#EEC036"},
  { label: "creamy", color: "#F8E6D1", textColor: "#6A6767"}, // custom text color as the tag is too pale for white
  { label: "sticky", color: "#D16D8B"},
  { label: "dry", color: "#BFC5C2", textColor: "#6A6767"},
  { label: "warm", color: "#DF7471"},
  { label: "hot", color: "#FF4B3E"},
  { label: "cool", color: "#4F7DA7"},
  { label: "cold", color: "#A5D8FF", textColor: "#6A6767"},
  { label: "crumbly", color: "#f7a663d9"}, // no figma color, subject to change
]

const prepTimeTags = [
  { label: "minimal prep", color: "#E0C5F0", textColor: "#6A6767" },
  { label: "moderate prep", color: "#9D7BAE" },
  { label: "full prep", color: "#775587" },
]

const stockTags = [
  { label: "in stock", color: "#A5D721", textColor: "#6A6767" },
  { label: "low stock", color: "#FFF017", textColor: "#6A6767" },  // custom text color as the tag is too pale for white
  { label: "out of stock", color: "#BF503F" }
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
  const [imageUrl, setImageUrl] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrepTags, setSelectedPrepTags] = useState<string[]>([])
  const [selectedStockTags, setSelectedStockTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev,tag]
    )
  }

  const togglePrepTag = (tag: string) => {
    setSelectedPrepTags(prev =>
      prev.includes(tag) ? [] : [tag]
    )
  }

  const toggleStockTag = (tag: string) => {
    setSelectedStockTags(prev =>
      prev.includes(tag) ? [] : [tag]
    )
  }

  const resetForm = () => {
    setName("")
    setImageUrl("")
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Missing field", "Name")
      return
    }

    const parsedInStock = selectedStockTags[0] ?? null


    setIsSaving(true)
    try {
      await addFood({
        name: name.trim(),
        isSafe: true,
        inStock: parsedInStock,
        imageUrl: imageUrl.trim() || undefined,
        tags: selectedTags,
        prepTime: selectedPrepTags,
      })
      resetForm()
      onClose()
    } catch (error) {
      showAlert("Save failed", "Unable to create food.")
    } finally {
      setIsSaving(false)
    }
  }

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  })

  if (!result.canceled) {
    setImageUrl(result.assets[0].uri)
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
          <Text text="name"  preset="subheading" style={{ color: "white" }} />
          <TextField value={name} onChangeText={setName} containerStyle={themed($field)} />

          {/* Sensory Tag Selector */}
          <Text text="sensory tags" preset="subheading" style={{ color: "white" }}/>
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text text={tag.label} style={{ color: textColor }} />
                    <Text text={active ? " -" : " +" } style={{ color: textColor }}/>
                  </View>
                </Pressable>
              )
            })}
          </View>

          {/* Prep Time Tag Selector */}
          <Text text="prep time" preset="subheading" style={{ color: "white" }} />
          <View style={themed($tagContainer)}>
            {prepTimeTags.map(tag => {
              const active = selectedPrepTags.includes(tag.label)
              const textColor = tag.textColor ?? "white"
              return (
                <Pressable 
                  key={tag.label} 
                  onPress={() => togglePrepTag(tag.label)}
                  style={themed($tag(active, tag.color))}
                >
                {/* add the +/- depending on if the tag is active or not */}
                  <View style={{ flexDirection: "row", alignItems: "center"}}>
                    <Text text={tag.label} style={{ color: textColor } } />
                    <Text text={ active ? " -" : " +" } style={{ color: textColor }}/>
                  </View>
                </Pressable>
              )
            })}
          </View>

          {/* Stock Tag Selector */}
          <Text text="add stock" preset="subheading" style={{ color: "white" }}/>
          <View style={themed($tagContainer)}>
            {stockTags.map(tag => {
              const active = selectedStockTags.includes(tag.label)
              const textColor = tag.textColor ?? "white"
              return (
                <Pressable 
                  key={tag.label} 
                  onPress={() => toggleStockTag(tag.label)}
                  style={themed($tag(active, tag.color))}
                >
                {/* add the +/- depending on if the tag is active or not */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text text={tag.label} style={{ color: textColor }} />
                    <Text text={active ? " -" : " +" } style={{ color: textColor }}/>
                  </View>
                </Pressable>
              )
            })}
          </View>
            <View style={{ alignItems: "flex-start", width: "100%", marginTop: 16 }}>
              <Button
                text="upload image"
                style={{
                  borderColor: "#C7D300",
                  borderWidth: 2,
                  backgroundColor: "#C7D300",
                  width: 160,
                  minHeight: 32,
                  paddingVertical: 6,
                }}
                textStyle={{ color: "white" }}
                onPress={pickImage}
              />
          </View>
          {/* add new safe food button */}
          <View style={{ width: "100%", marginTop: 10 }}>
            <Button 
              text="add new safe food" 
              onPress={handleSave} 
              disabled={isSaving} 
              preset="filled"
              style={{ backgroundColor: "#FF9400", minHeight: 40, }}
              textStyle={{ color: "white" }}
            />
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
  height: "auto",
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
  gap: 6, 
  marginVertical: 6, 
})

const $tag = (active: boolean, color: string): ThemedStyle<ViewStyle> => ({ colors }) => ({ 
  paddingVertical: 4, 
  paddingHorizontal: 8, 
  borderRadius: 3, 
  backgroundColor: color, 
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  alignSelf: "flex-start",

})

const $action: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg  
})