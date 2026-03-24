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
  onViewRecipe: (food: Doc<"foods">) => void
}


export function FoodCard({
  item,
  onEdit,
  themed,
  $itemContainer,
  $image,
  $label,
  $metaLabel,
  onViewRecipe,
}: FoodCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setIsFlipped(!isFlipped)}
      style={themed($itemContainer)}
    >
      {isFlipped ? (
        <BackOfCard item={item} onEdit={onEdit} onViewRecipe={onViewRecipe} />
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
    </>
  )
}

type BackProps = {
  item: Doc<"foods"> & { height: number }
  onEdit: (food: Doc<"foods">) => void
  onViewRecipe: (food: Doc<"foods">) => void
}

function BackOfCard({ item, onEdit, onViewRecipe }: BackProps) {

  let maxVisibleTags = 3
  if (item.height > 250) maxVisibleTags = 4
  if (item.height > 260) maxVisibleTags = 5
  if (item.height > 370) maxVisibleTags = 6

  // Combine all tag groups into one array
  const allTags = [
    ...(item.tags ?? []),
    ...(item.prepTime ?? []),
    ...(item.inStock ? [item.inStock] : []) 
  ]

  const visibleTags = allTags.slice(0, maxVisibleTags)
  const overflowTagCount = allTags.length - visibleTags.length

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
          {visibleTags.map(tag => {
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

          {overflowTagCount > 0 && (
            <View
              style={{
                  backgroundColor: "#eeeeee00",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginRight: 6,
                  marginBottom: 4,
                }}
            >
              <Text 
                text={"+" + overflowTagCount + " more"}
                style = {{ fontWeight: "600" }}
              />
            </View>
          )}
        </View>
      </View>

      {/* Bottom buttons */}
      <Button
        text="view recipe"
        onPress={() => onViewRecipe(item)}
        style={{
          minHeight: 26, 
          paddingVertical: 0,
          borderWidth: 2,
          borderColor: "#001CD3",
          backgroundColor: "#001CD3",
          borderRadius: 8,
          justifyContent: "center",
        }}
        textStyle={{
          color: "white",
          fontSize: 14,

        }}
      />

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
