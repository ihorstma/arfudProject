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
        <View style={themed($modal)} backgroundColor="#F5F3F0">

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
            text="are you sure you want to delete this safe food?"
            preset="subheading"
            style={{ textAlign: "center", color: "black", marginBottom: 8 }}
          />

          {/* Description */}
          <Text
            text="doing so will permanently remove it from your safe foods and archive."
            style={{ textAlign: "center", color: "black", marginBottom: 24 }}
          />

          {/* Delete and cancel button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              gap: 12,
              marginBottom: 2,
            }}
          >
          <Button
            text="cancel"
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: "#828282",
              minHeight: 40,
              marginBottom: 10,
            }}
            textStyle={{ color: "white" }}
          />
          <Button
            text="delete"
            onPress={onDelete}
            style={{
              flex: 1,
              backgroundColor: "#D52004",
              minHeight: 40,
              marginBottom: 10,
            }}
            textStyle={{ color: "white" }}
          />
        </View>
          

          {/* Move to archive instead */}
          <Button
            text="move to archive instead"
            onPress={onArchive}
            style={{
              backgroundColor: "#775587",
              minHeight: 40,
              marginBottom: 12,
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
