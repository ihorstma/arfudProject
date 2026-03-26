import { create } from "zustand"

type ArchiveState = {
    isArchiveOpen: boolean
    setArchiveOpen: (value: boolean) => void
}

export const useArchiveMode = create<ArchiveState>((set) => ({
    isArchiveOpen: false,
    setArchiveOpen: (value) => set({ isArchiveOpen: value }),
}))