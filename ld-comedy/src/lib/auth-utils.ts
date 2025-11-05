import { Role } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Non autorisé")
  }
  return user
}

export async function requireRole(requiredRole: Role) {
  const user = await requireAuth()
  if (user.role !== requiredRole) {
    throw new Error(`Accès refusé. Rôle requis: ${requiredRole}`)
  }
  return user
}

export async function requireAnyRole(requiredRoles: Role[]) {
  const user = await requireAuth()
  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Accès refusé. Rôles requis: ${requiredRoles.join(", ")}`)
  }
  return user
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return userRole === requiredRole
}

export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole)
}

export function isAdmin(userRole: Role): boolean {
  return userRole === "ADMIN"
}

export function isArtist(userRole: Role): boolean {
  return userRole === "ARTIST"
}

export function isTheater(userRole: Role): boolean {
  return userRole === "THEATER"
}

export function isPending(userRole: Role): boolean {
  return userRole === "PENDING"
}

export function canAccessArtistDashboard(userRole: Role): boolean {
  return isArtist(userRole) || isAdmin(userRole)
}

export function canAccessTheaterDashboard(userRole: Role): boolean {
  return isTheater(userRole) || isAdmin(userRole)
}

export function canManageUser(currentUserRole: Role, targetUserRole: Role): boolean {
  if (isAdmin(currentUserRole)) return true
  // Les utilisateurs ne peuvent gérer que leur propre profil
  return currentUserRole === targetUserRole
}

export function canCreateEvent(userRole: Role): boolean {
  return isTheater(userRole) || isAdmin(userRole)
}

export function canEditEvent(userRole: Role, eventOwnerId: string, currentUserId: string): boolean {
  if (isAdmin(userRole)) return true
  if (isTheater(userRole) && eventOwnerId === currentUserId) return true
  return false
}

export function canBookEvent(userRole: Role): boolean {
  return isArtist(userRole) || isTheater(userRole)
}

export function canManageTheater(currentUserRole: Role, theaterOwnerId: string, currentUserId: string): boolean {
  if (isAdmin(currentUserRole)) return true
  if (isTheater(currentUserRole) && theaterOwnerId === currentUserId) return true
  return false
}

export function canManageArtist(currentUserRole: Role, artistOwnerId: string, currentUserId: string): boolean {
  if (isAdmin(currentUserRole)) return true
  if (isArtist(currentUserRole) && artistOwnerId === currentUserId) return true
  return false
}

// Fonction pour obtenir le dashboard URL approprié selon le rôle
export function getDashboardUrl(role: Role): string {
  switch (role) {
    case "ARTIST":
      return "/dashboard-artiste"
    case "THEATER":
      return "/dashboard-theatre"
    case "ADMIN":
      return "/dashboard-admin"
    default:
      return "/choix-roles"
  }
}

// Fonction pour obtenir le nom d'affichage du rôle
export function getRoleDisplayName(role: Role): string {
  switch (role) {
    case "ARTIST":
      return "Artiste"
    case "THEATER":
      return "Théâtre"
    case "ADMIN":
      return "Administrateur"
    case "PENDING":
      return "En attente"
    default:
      return "Inconnu"
  }
}
