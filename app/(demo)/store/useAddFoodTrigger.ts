import { create } from "zustand"

interface AddFoodTriggerState {
  trigger: boolean
  setTrigger: (v: boolean) => void
}

export const useAddFoodTrigger = create<AddFoodTriggerState>((set) => ({
  trigger: false,
  setTrigger: (v) => set({ trigger: v }),
}))
