"use client"

import { signIn, signOut } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { UserProfile } from "./user-profile"
import { DashboardModal } from "./dashboard-modal"
import { LogIn, UserPlus, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AuthButton() {
  const { isAuthenticated, isLoading } = useAuth()
  const [showDashboardModal, setShowDashboardModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse">
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowDashboardModal(true)}
            size="sm"
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <UserProfile />
        </div>
        <DashboardModal 
          isOpen={showDashboardModal} 
          onClose={() => setShowDashboardModal(false)} 
        />
      </>
    )
  }

  return (
    <div className="flex items-center space-x-2">      <Link href="/connexion">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-gray-600 hover:text-purple-600"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Connexion</span>
        </Button>
      </Link>
      <Link href="/register">
        <Button
          size="sm"
          className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">S'inscrire</span>
        </Button>
      </Link>
    </div>
  )
}

export function QuickAuthActions() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <Button
        onClick={() => signOut()}
        variant="outline"
        size="sm"
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        Se déconnecter
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => signIn()}
        variant="outline"
        size="sm"
      >
        Se connecter
      </Button>
      <Link href="/register">
        <Button size="sm">
          S'inscrire
        </Button>
      </Link>
    </div>
  )
}
