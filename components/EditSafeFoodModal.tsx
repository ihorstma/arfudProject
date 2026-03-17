// the edit a safe food modal

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
import { Doc } from "@/convex/_generated/dataModel"

import DeletePopupModal from "./DeletePopupModal"
import { availableTags, prepTimeTags, stockTags } from "./FoodTagsInfo/FoodTags"

interface EditFoodModalProps {
  visible: boolean
  onClose: () => void
  food: Doc<"foods">
}

export default function EditSafeFoodModal({ visible, onClose, food }: EditFoodModalProps) {
  const { themed } = useAppTheme()
  const updateFood = useMutation(api.foods.updateFood)
  const { showAlert } = useCustomAlert()
  const deleteFood = useMutation(api.foods.deleteFood)

  const [name, setName] = useState(food.name)
  const [imageUrl, setImageUrl] = useState(food.imageUrl ?? "")
  const [selectedTags, setSelectedTags] = useState(food.tags ?? [])
  const [selectedPrepTags, setSelectedPrepTags] = useState(food.prepTime ?? [])
  const [selectedStockTags, setSelectedStockTags] = useState(
    food.inStock ? [food.inStock] : []
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

  const handleArchive = async () => {
    await updateFood({
      id: food._id,
      isSafe: false,
    })
    onClose()
  }

  const handleDelete = async () => {
    await deleteFood({ id: food._id })
    onClose()
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Missing field", "Name")
      return
    }

    const parsedInStock = selectedStockTags[0] ?? null


    setIsSaving(true)
    try {
      await updateFood({
        id: food._id,
        name: name.trim(),
        imageUrl: imageUrl.trim() || undefined,
        tags: selectedTags,
        prepTime: selectedPrepTags,
        inStock: selectedStockTags[0] ?? null,
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
            <Text text="edit safe food" style={themed($headerTitle)} />
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
          {/* save safe food button */}
          <View style={{ width: "100%", marginTop: 10 }}>
            <Button 
              text="save changes" 
              onPress={handleSave} 
              disabled={isSaving} 
              preset="filled"
              style={{ backgroundColor: "#FF9400", minHeight: 40, }}
              textStyle={{ color: "white" }}
            />
          </View>

          {/* Archive + Delete buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 16,
              gap: 12,
           }}
          >
          <Button
            text="move to archive"
            style={{
              flex: 1,
              minHeight: 36,
              backgroundColor: "#1B612D",
              paddingVertical: 6,
            }}
            textStyle={{ color: "white" }}
            onPress={handleArchive}
        />

        <Button
          text="delete"
          style={{
            flex: 1,
            minHeight: 36,
            backgroundColor: "#D52004",
            paddingVertical: 6,
          }}
          textStyle={{ color: "white" }}
          onPress={() => setShowDeleteConfirm(true)}
        />
        </View>
      </View>

      {/* DELETE CONFIRM POPUP LIVES INSIDE THIS SAME MODAL */}
      {showDeleteConfirm && (
        <DeletePopupModal
          visible={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onDelete={handleDelete}
          onArchive={handleArchive}
        />
      )}

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