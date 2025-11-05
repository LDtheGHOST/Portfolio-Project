"use client"

import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
    role: user?.role,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
  }
}

export function useRequireAuth() {
  const auth = useAuth()
  
  if (auth.isUnauthenticated) {
    throw new Error("Authentification requise")
  }
  
  return auth
}

export function useRequireRole(requiredRole: Role) {
  const auth = useRequireAuth()
  
  if (auth.role !== requiredRole) {
    throw new Error(`Rôle requis: ${requiredRole}`)
  }
  
  return auth
}

export function useRequireAnyRole(requiredRoles: Role[]) {
  const auth = useRequireAuth()
  
  if (!requiredRoles.includes(auth.role as Role)) {
    throw new Error(`Rôles requis: ${requiredRoles.join(", ")}`)
  }
  
  return auth
}

// Hooks utilitaires pour les rôles
export function useIsAdmin() {
  const { role } = useAuth()
  return role === "ADMIN"
}

export function useIsArtist() {
  const { role } = useAuth()
  return role === "ARTIST"
}

export function useIsTheater() {
  const { role } = useAuth()
  return role === "THEATER"
}

export function useIsPending() {
  const { role } = useAuth()
  return role === "PENDING"
}

export function useCanAccessArtistDashboard() {
  const { role } = useAuth()
  return role === "ARTIST" || role === "ADMIN"
}

export function useCanAccessTheaterDashboard() {
  const { role } = useAuth()
  return role === "THEATER" || role === "ADMIN"
}

export function useCanCreateEvent() {
  const { role } = useAuth()
  return role === "THEATER" || role === "ADMIN"
}

export function useCanBookEvent() {
  const { role } = useAuth()
  return role === "ARTIST" || role === "THEATER"
}
