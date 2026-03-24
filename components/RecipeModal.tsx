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
  initialRecipe?: {
    ingredients: { name: string; quantity: string }[]
    instructions: string
  }
}

export function RecipeModal({ visible, onClose, onSave, initialRecipe }:  Props) {
    const { themed } = useAppTheme()
    const safeInitial = initialRecipe && Array.isArray(initialRecipe.ingredients) ? initialRecipe : {
        ingredients: [{ name: "", quantity: "" }],
        instructions: "",
    }
    const [ingredients, setIngredients] = useState(safeInitial.ingredients)

    const [instructions, setInstructions] = useState(safeInitial.instructions)
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

    const deleteIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={themed($backdrop)}>
                <View style={themed($modal)}>
          
                {/* header */}
                <View style={{ alignItems: "center", marginBottom: 12, marginTop: 20 }}>
                    <Text text="add recipe" style={themed($headerTitle)} />
                    <Pressable onPress={onClose} style={{ position: "absolute", right: 0, top: 0 }}>
                        <MaterialCommunityIcons name="close" size={24} color="white" />
                    </Pressable>
                </View>

                <ScrollView style={{ maxHeight: "80%" }} showsVerticalScrollIndicator={false}>
            
                    {/* ingredients */}
                    <Text text="ingredients" preset="subheading" style={{ color: "white", flex: 1 }} />

                    {ingredients.map((ing, index) => (
                      <View key={index} style={{ flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" }}>
                        {/* ingredient name */}
                        <TextField
                            value={ing.name}
                            onChangeText={(t) => updateIngredient(index, "name", t)}
                            placeholder="ingredient"
                            containerStyle={{ flex: 1 }}
                        />
                        {/* ingredient quantity */}
                        <TextField
                            value={ing.quantity}
                            onChangeText={(t) => updateIngredient(index, "quantity", t)}
                            placeholder="qty"
                            containerStyle={{ width: 80 }}
                        />
                        {/* delete ingredient */}
                        <Pressable
                            onPress={() => deleteIngredient(index)}
                            style={{
                                padding: 4,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color="white" />
                        </Pressable>

                      </View>
                    ))}

                    {/* add ingredient button */}
                    <Pressable onPress={addIngredientRow} style={themed($addRow)}>
                        <Text text="+ add ingredient" style={{ color: "white" }} />
                    </Pressable>

                    {/* instructions (text entry box) */}
                    <Text text="instructions" preset="subheading" style={{ color: "white", marginTop: "auto" }} />
                    <TextField
                        value={instructions}
                        onChangeText={setInstructions}
                        multiline
                        containerStyle={{ height: 120 }}
                    />

                </ScrollView>

                {/* save button */}
                <Button
                    text="save recipe"
                    onPress={() => {
                        const cleanedIngredients = ingredients.filter(
                            ing => ing.name.trim() !== "" || ing.quantity.trim() !== ""
                        )
                        onSave({ ingredients: cleanedIngredients, instructions })
                    }}
                    style={{ backgroundColor: "#FF9400", minHeight: 40, marginTop: 12, marginBottom: 20 }}
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
  width: "90%",
  backgroundColor: colors.createNewFoodModalBackground,
  padding: spacing.lg,
  borderRadius: 16,
  height: "85%",
})

const $headerTitle = ({ typography }) => ({
  fontFamily: typography.primary.bold,
  fontSize: 24,
  color: "white",
})

const $addRow = () => ({
  paddingVertical: 10,
  paddingHorizontal: 12,
  backgroundColor: "#001CD3",
  alignItems: "center",
  marginBottom: 12,
})