"use client"

import { useAuth } from "@/hooks/use-auth"
import { Role } from "@prisma/client"
import { ReactNode } from "react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: Role
  requiredRoles?: Role[]
  fallback?: ReactNode
  inverse?: boolean
}

export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
  inverse = false,
}: RoleGuardProps) {
  const { role, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback
  }

  let hasPermission = false

  if (requiredRole) {
    hasPermission = role === requiredRole
  } else if (requiredRoles) {
    hasPermission = requiredRoles.includes(role as Role)
  } else {
    hasPermission = true // Si aucun rôle n'est requis, seule l'authentification est nécessaire
  }

  if (inverse) {
    hasPermission = !hasPermission
  }

  return hasPermission ? <>{children}</> : fallback
}

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : fallback
}

interface UnauthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function UnauthGuard({ children, fallback = null }: UnauthGuardProps) {
  const { isUnauthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return isUnauthenticated ? <>{children}</> : fallback
}
