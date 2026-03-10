import { Modal, View, Pressable } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"

interface Props {
  visible: boolean
  onCancel: () => void
  onDelete: () => void
  onArchive: () => void
}

export default function DeletePopupModal({
  visible,
  onCancel,
  onDelete,
  onArchive,
}: Props) {
  const { themed } = useAppTheme()

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={themed($backdrop)}>
        <View style={themed($modal)}>

          {/* Warning Icon */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color="#D52004"
            />
          </View>

          {/* Title */}
          <Text
            text="Delete this food?"
            preset="subheading"
            style={{ textAlign: "center", color: "white", marginBottom: 8 }}
          />

          {/* Description */}
          <Text
            text="This action cannot be undone."
            style={{ textAlign: "center", color: "white", marginBottom: 24 }}
          />

          {/* Delete button */}
          <Button
            text="delete"
            onPress={onDelete}
            style={{
              backgroundColor: "#D52004",
              minHeight: 40,
              marginBottom: 12,
            }}
            textStyle={{ color: "white" }}
          />

          {/* Move to archive instead */}
          <Button
            text="move to archive instead"
            onPress={onArchive}
            style={{
              backgroundColor: "#1B612D",
              minHeight: 40,
              marginBottom: 12,
            }}
            textStyle={{ color: "white" }}
          />

          {/* Cancel */}
          <Button
            text="cancel"
            preset="outline"
            onPress={onCancel}
            style={{
              borderColor: "white",
              minHeight: 40,
            }}
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
