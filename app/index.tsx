import { Redirect } from "expo-router"

import { useAuth } from "@/context/AuthContext"

export default function Index() {
  const { isAuthenticated, isPending } = useAuth()
  if (isPending) return null
  return <Redirect href={isAuthenticated ? "/(demo)/food-grid" : "/login"} />
}
