import { useState } from "react"
import { TouchableOpacity, View, Image } from "react-native"
import { Text } from "./Text"
import { Button } from "./Button"
import type { Doc } from "@/convex/_generated/dataModel"

type FoodCardProps = {
  item: Doc<"foods"> & { height: number }
  onEdit: (food: Doc<"foods">) => void
  themed: any
  $itemContainer: any
  $image: any
  $label: any
  $metaLabel: any
}


export function FoodCard({
  item,
  onEdit,
  themed,
  $itemContainer,
  $image,
  $label,
  $metaLabel,
}: FoodCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsFlipped(!isFlipped)}
      style={themed($itemContainer)}
    >
      {isFlipped ? (
        <BackOfCard item={item} onEdit={onEdit} />
      ) : (
        <FrontOfCard
          item={item}
          themed={themed}
          $image={$image}
          $label={$label}
          $metaLabel={$metaLabel}
        />
      )}
    </TouchableOpacity>
  )
}

type FrontProps = {
  item: Doc<"foods"> & { height: number }
  themed: any
  $image: any
  $label: any
  $metaLabel: any
}

function FrontOfCard({ item, themed, $image, $label, $metaLabel }: FrontProps) {
  return (
    <>
      <Image
        source={{ uri: item.imageUrl || "https://loremflickr.com/300/300/food" }}
        style={[themed($image), { height: item.height }]}
        resizeMode="cover"
      />

      <Text style={themed($label)} numberOfLines={1}>
        {item.name}
      </Text>

      <Text style={themed($metaLabel)} numberOfLines={1}>
        {item.inStock ? "In stock" : "Out of stock"}
      </Text>
    </>
  )
}

type BackProps = {
  item: Doc<"foods">
  onEdit: (food: Doc<"foods">) => void
}

function BackOfCard({ item, onEdit }: BackProps) {
  return (
    <View style={{ padding: 8 }}>
      <Text preset="bold" text={item.name} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
        {item.tags?.map(tag => (
          <View
            key={tag}
            style={{
              backgroundColor: "#eee",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              marginRight: 6,
              marginBottom: 6,
            }}
          >
            <Text text={tag} />
          </View>
        ))}
      </View>

      <Button
        text="edit safe food"
        style={{ marginTop: 12 }}
        onPress={() => onEdit(item)}
      />
    </View>
  )
}
