import { Modal, View, Pressable } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { ScrollView } from "react-native-gesture-handler"
import { TextField } from "@/components/TextField"
import { useState } from "react"

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (recipe: { ingredients: { name: string; quantity: string }[]; instructions: string }) => void
}

export function RecipeModal({ visible, onClose, onSave }:  Props) {
    const { themed } = useAppTheme()
    const [ingredients, setIngredients] = useState([
        { name: "", quantity: "" }
    ])
    const [instructions, setInstructions] = useState("")
    const addIngredientRow = () => {
        setIngredients(prev => [...prev, { name: "", quantity: "" }])
    }
    const updateIngredient = (index: number, field: "name" | "quantity", value: string) => {
        setIngredients(prev => {
            const copy = [...prev]
            copy[index][field] = value
            return copy
        })
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={themed($backdrop)}>
                <View style={themed($modal)}>
          
                {/* HEADER */}
                <View style={{ alignItems: "center", marginBottom: 12 }}>
                    <Text text="add recipe" style={themed($headerTitle)} />
                    <Pressable onPress={onClose} style={{ position: "absolute", right: 0, top: 0 }}>
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                    </Pressable>
                </View>

                <ScrollView style={{ maxHeight: "80%" }} showsVerticalScrollIndicator={false}>
            
                    {/* INGREDIENTS */}
                    <Text text="ingredients" preset="subheading" style={{ color: "white" }} />

                    {ingredients.map((ing, index) => (
                      <View key={index} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                        <TextField
                            value={ing.name}
                            onChangeText={(t) => updateIngredient(index, "name", t)}
                            placeholder="ingredient"
                            containerStyle={{ flex: 1 }}
                        />
                        <TextField
                            value={ing.quantity}
                            onChangeText={(t) => updateIngredient(index, "quantity", t)}
                            placeholder="qty"
                            containerStyle={{ width: 80 }}
                        />
                      </View>
                    ))}

                    {/* ADD INGREDIENT BUTTON */}
                    <Pressable onPress={addIngredientRow} style={themed($addRow)}>
                        <Text text="+ add ingredient" style={{ color: "white" }} />
                    </Pressable>

                    {/* INSTRUCTIONS */}
                    <Text text="instructions" preset="subheading" style={{ color: "white", marginTop: 16 }} />
                    <TextField
                        value={instructions}
                        onChangeText={setInstructions}
                        multiline
                        containerStyle={{ height: 120 }}
                    />

                </ScrollView>

                {/* SAVE BUTTON */}
                <Button
                    text="save recipe"
                    onPress={() => onSave({ ingredients, instructions })}
                    style={{ backgroundColor: "#FF9400", minHeight: 40, marginTop: 12 }}
                    textStyle={{ color: "white" }}
                />

            </View>
        </View>
      </Modal>
    )
}

const $backdrop = () => ({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
})

const $modal = ({ spacing, colors }) => ({
  width: "85%",
  backgroundColor: colors.createNewFoodModalBackground,
  padding: spacing.lg,
  borderRadius: 16,
})

const $headerTitle = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 24,
  color: "white",
})

const $addRow = () => ({
  paddingVertical: 10,
  paddingHorizontal: 12,
  backgroundColor: "#444",
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 12,
})