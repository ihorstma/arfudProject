import { createContext, useContext, useState, useMemo, ReactNode } from "react"
import { format } from "date-fns"

import { api } from "@/services/api/api"
import { EpisodeItem } from "@/services/api/types"

interface EpisodeContextType {
  episodes: EpisodeItem[]
  episodesForList: EpisodeItem[]
  favorites: string[]
  favoritesOnly: boolean
  isLoading: boolean
  totalEpisodes: number
  totalFavorites: number
  fetchEpisodes: () => Promise<void>
  toggleFavorite: (episode: EpisodeItem) => void
  toggleFavoritesOnly: () => void
}

const EpisodeContext = createContext<EpisodeContextType | undefined>(undefined)

export const EpisodeProvider = ({ children }: { children: ReactNode }) => {
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchEpisodes = async () => {
    setIsLoading(true)
    const result = await api.getEpisodes()
    if (result.kind === "ok") {
      setEpisodes(result.episodes)
    }
    setIsLoading(false)
  }

  const toggleFavorite = (episode: EpisodeItem) => {
    if (favorites.includes(episode.guid)) {
      setFavorites(favorites.filter((id) => id !== episode.guid))
    } else {
      setFavorites([...favorites, episode.guid])
    }
  }

  const toggleFavoritesOnly = () => {
    setFavoritesOnly(!favoritesOnly)
  }

  const episodesForList = favoritesOnly
    ? episodes.filter((e) => favorites.includes(e.guid))
    : episodes

  const value = {
    episodes,
    episodesForList,
    favorites,
    favoritesOnly,
    isLoading,
    totalEpisodes: episodes.length,
    totalFavorites: favorites.length,
    fetchEpisodes,
    toggleFavorite,
    toggleFavoritesOnly,
  }

  return <EpisodeContext.Provider value={value}>{children}</EpisodeContext.Provider>
}

export const useEpisodes = () => {
  const context = useContext(EpisodeContext)
  if (!context) {
    throw new Error("useEpisodes must be used within an EpisodeProvider")
  }
  return context
}

export const useEpisode = (episode: EpisodeItem) => {
  const { favorites } = useEpisodes()
  const isFavorite = favorites.includes(episode.guid)

  const datePublished = useMemo(() => {
    try {
      const date = new Date(episode.pubDate)
      return {
        textLabel: format(date, "MMM dd, yyyy"),
        accessibilityLabel: `Published on ${format(date, "MMMM do, yyyy")}`,
      }
    } catch {
      return { textLabel: "", accessibilityLabel: "" }
    }
  }, [episode.pubDate])

  const duration = useMemo(() => {
    const seconds = episode.enclosure.duration
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const textLabel = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`
    return {
      textLabel,
      accessibilityLabel: `Duration: ${h} hours ${m} minutes`,
    }
  }, [episode.enclosure.duration])

  const parsedTitleAndSubtitle = useMemo(() => {
    const parts = episode.title.split(" - ")
    return {
      title: parts[0],
      subtitle: parts[1] || "",
    }
  }, [episode.title])

  return {
    isFavorite,
    datePublished,
    duration,
    parsedTitleAndSubtitle,
  }
}
