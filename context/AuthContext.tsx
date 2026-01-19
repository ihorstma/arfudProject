import { createContext, FC, PropsWithChildren, useCallback, useContext } from "react"

import { authClient } from "@/services/auth-client"

export type AuthContextType = {
  isAuthenticated: boolean
  session: any // Better Auth session type
  logout: () => void
  isPending: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const { data: session, isPending } = authClient.useSession()

  const logout = useCallback(async () => {
    await authClient.signOut()
  }, [])

  const value = {
    isAuthenticated: !!session,
    session,
    logout,
    isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
