"use client"

import { useAuth } from "@/hooks/use-auth"
import { signOut } from "next-auth/react"
import { User, LogOut, Settings, Shield } from "lucide-react"
import { getRoleDisplayName } from "@/lib/auth-utils"

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export function UserAvatar() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
      <User className="h-4 w-4 text-white" />
    </div>
  )
}

export function UserBadge() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  const roleColor = {
    ADMIN: "bg-red-100 text-red-800",
    ARTIST: "bg-blue-100 text-blue-800",
    THEATER: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  }

  return (
    <div className="flex items-center space-x-2">
      <UserAvatar />
      <div>
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColor[user.role]}`}>
          {getRoleDisplayName(user.role)}
        </span>
      </div>
    </div>
  )
}

interface UserStatusProps {
  showRole?: boolean
  showEmail?: boolean
}

export function UserStatus({ showRole = true, showEmail = false }: UserStatusProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-sm text-gray-500">
        Non connecté
      </div>
    )
  }

  return (
    <div className="text-sm">
      <p className="font-medium text-gray-900">{user.name}</p>
      {showEmail && (
        <p className="text-xs text-gray-500">{user.email}</p>
      )}
      {showRole && (
        <p className="text-xs text-gray-600">{getRoleDisplayName(user.role)}</p>
      )}
    </div>
  )
}
