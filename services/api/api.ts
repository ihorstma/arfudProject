import { EpisodeItem } from "./types"

const MOCK_EPISODES: EpisodeItem[] = [
  {
    guid: "1",
    title: "React Native Radio 294 - React Native 0.74",
    pubDate: "2024-04-24 10:00:00",
    link: "https://reactnativeradio.com",
    author: "Infinite Red",
    thumbnail: "https://reactnativeradio.com/images/rnr-logo.png",
    description: "React Native 0.74 is here!",
    content: "Full content here...",
    enclosure: {
      link: "https://traffic.libsyn.com/reactnativeradio/RNR_294.mp3",
      type: "audio/mpeg",
      length: 123456,
      duration: 1800,
      rating: { scheme: "urn:simple", value: "clean" },
    },
    categories: ["podcast"],
  },
  {
    guid: "2",
    title: "React Native Radio 293 - Chain React 2024",
    pubDate: "2024-04-17 10:00:00",
    link: "https://reactnativeradio.com",
    author: "Infinite Red",
    thumbnail: "https://reactnativeradio.com/images/rnr-logo.png",
    description: "Chain React is coming back!",
    content: "Full content here...",
    enclosure: {
      link: "https://traffic.libsyn.com/reactnativeradio/RNR_293.mp3",
      type: "audio/mpeg",
      length: 123456,
      duration: 2000,
      rating: { scheme: "urn:simple", value: "clean" },
    },
    categories: ["podcast"],
  },
]

export const api = {
  getEpisodes: async (): Promise<{ kind: "ok"; episodes: EpisodeItem[] }> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate delay
    return { kind: "ok", episodes: MOCK_EPISODES }
  },
}
