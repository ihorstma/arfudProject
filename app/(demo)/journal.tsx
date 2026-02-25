import { useMemo } from "react"
import {
  Image,
  ImageStyle,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

interface JournalEntry {
  id: string
  title: string
  body: string
  date: string
  isBookmarked: boolean
  images?: string[]
}

const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    title: "a really good day!!!",
    body: "i'm really proud of myself for eating so much today. i actually ate three different full meals, which i haven't been able to do in so long!",
    date: "sunday, oct 19",
    isBookmarked: true,
    images: [
      "https://loremflickr.com/300/300/pancakes?lock=1",
      "https://loremflickr.com/300/300/pasta?lock=2",
      "https://loremflickr.com/300/300/soup?lock=3",
    ],
  },
  {
    id: "2",
    title: "frustrated",
    body: "i'm feeling really discouraged about my nutrition. it was really hard to eat today.",
    date: "monday, oct 20",
    isBookmarked: true,
  },
  {
    id: "3",
    title: "snacky day",
    body: "i ate mostly snacks today, which is okay but my body doesn't physically feel super good about it. i'm glad i at least ate some fruit.",
    date: "tuesday, oct 21",
    isBookmarked: true,
  },
]

export default function JournalScreen() {
  const { themed } = useAppTheme()
  const router = useRouter()

  const entries = useMemo(() => MOCK_JOURNAL_ENTRIES, [])

  const renderEntry = (entry: JournalEntry) => (
    <View key={entry.id} style={themed($entryCard)}>
      <View style={themed($entryHeader)}>
        <Text text={entry.title} style={themed($entryTitle)} />
        <TouchableOpacity>
          <MaterialCommunityIcons
            name={entry.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <Text text={entry.body} style={themed($entryBody)} />

      {entry.images && entry.images.length > 0 && (
        <View style={themed($imageContainer)}>
          {entry.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={themed($entryImage)} />
          ))}
        </View>
      )}

      <View style={themed($entryFooter)}>
        <Text text={entry.date} style={themed($entryDate)} />
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor="#1D7E73"
      systemBarStyle="light"
      style={themed($screenBackground)}
      contentContainerStyle={$styles.flex1}
    >
      <View style={themed($header)}>
        <Text text="journal" style={themed($title)} />
        <TouchableOpacity style={themed($addIcon)}>
          <MaterialCommunityIcons name="note-plus-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={$styles.flex1}
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {entries.map(renderEntry)}
      </ScrollView>
    </Screen>
  )
}

const $screenBackground: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#1D7E73", // Matching the teal/green background from mockup
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.sm,
})

const $title: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 38,
  fontFamily: typography.primary.bold,
  color: "white",
  letterSpacing: -1,
  lineHeight: 46,
})

const $addIcon: ThemedStyle<ViewStyle> = () => ({
  padding: 4,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: 120,
})

const $entryCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.1)",
})

const $entryHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: 12,
})

const $entryTitle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 24,
  fontFamily: typography.primary.bold,
  color: "white",
  flex: 1,
  marginRight: 8,
})

const $entryBody: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: "rgba(255, 255, 255, 0.9)",
  lineHeight: 22,
  marginBottom: 16,
})

const $imageContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  gap: 10,
  marginBottom: 16,
})

const $entryImage: ThemedStyle<ImageStyle> = () => ({
  width: 90,
  height: 120,
  borderRadius: 16,
  backgroundColor: "rgba(0,0,0,0.1)",
})

const $entryFooter: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 4,
})

const $entryDate: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
  color: "rgba(255, 255, 255, 0.7)",
  fontWeight: "500",
})
