// the cards displayed in the safe foods screen

import { useState } from "react"
import { TouchableOpacity, View, Image } from "react-native"
import { Text } from "./Text"
import { Button } from "./Button"
import type { Doc } from "@/convex/_generated/dataModel"
import { availableTags, prepTimeTags, stockTags } from "@/components/FoodTagsInfo/FoodTags"

function getTagInfo(label: string) {
  return (
    availableTags.find(t => t.label === label) ||
    prepTimeTags.find(t => t.label === label) ||
    stockTags.find(t => t.label === label)
  )
}

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
  item: Doc<"foods"> & { height: number }
  onEdit: (food: Doc<"foods">) => void
}

function BackOfCard({ item, onEdit }: BackProps) {
  // Combine all tag groups into one array
  const allTags = [
    ...(item.tags ?? []),
    ...(item.prepTime ?? []),
    ...(item.inStock ? [item.inStock] : []) 
  ]

  return (
    <View
      style={{
        height: item.height,
        padding: 12,
        backgroundColor: "#DA68A347",
        borderRadius: 16,
        overflow: "hidden",
        justifyContent: "space-between",
      }}
    >
      {/* Top content */}
      <View>
        <Text
          text={item.name}
          style={{
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
          }}
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
          {allTags.map(tag => {
            const info = getTagInfo(tag)

            return (
              <View
                key={tag}
                style={{
                  backgroundColor: info?.color ?? "#eee",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text
                  text={tag}
                  style={{
                    color: info?.textColor ?? "white",
                    fontWeight: "600",
                  }}
                />
              </View>
            )
          })}
        </View>
      </View>

      {/* Bottom button */}
      <Button
        text="edit safe food"
        onPress={() => onEdit(item)}
        style={{
          minHeight: 26, 
          paddingVertical: 0,
          borderWidth: 2,
          borderColor: "#DA68A3",
          backgroundColor: "#DA68A3",
          borderRadius: 8,
          justifyContent: "center",
        }}
        textStyle={{
          color: "white",
          fontSize: 14,

        }}
      />
    </View>
  )
}
