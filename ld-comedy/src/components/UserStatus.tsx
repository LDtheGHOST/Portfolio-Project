"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function UserStatus() {
  const { data: session, status } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  // Déterminer le dashboard selon le rôle
  const getDashboardUrl = () => {
    const userRole = session?.user?.role
    switch (userRole) {
      case "ARTIST":
        return "/dashboard-artiste"
      case "THEATER":
        return "/dashboard-theatre"
      default:
        return "/choix-roles" // Si pas de rôle, rediriger vers la sélection
    }
  }

  // Déterminer le label selon le rôle
  const getDashboardLabel = () => {
    const userRole = session?.user?.role
    switch (userRole) {
      case "ARTIST":
        return "Mon espace artiste"
      case "THEATER":
        return "Mon espace théâtre"
      default:
        return "Choisir mon rôle"
    }
  }

  if (status === "loading") {
    return <div className="animate-pulse h-10 w-28 bg-amber-400/20 rounded-lg"></div>
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex space-x-2">
        <Link href="/connexion">
          <Button className="bg-transparent border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950">
            Connexion
          </Button>
        </Link>
        <Link href="/inscription">
          <Button className="bg-amber-400 text-red-950 hover:bg-amber-500">Inscription</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-2 bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full border border-amber-400/30 transition-colors"
      >
        <span className="font-medium">{session?.user?.name || "Utilisateur"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${showMenu ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm border border-amber-400/20 rounded-lg shadow-lg overflow-hidden z-10">
          <div className="p-4 border-b border-amber-400/10">
            <p className="text-white font-medium">{session?.user?.name}</p>
            <p className="text-gray-400 text-sm truncate">{session?.user?.email}</p>
            {session?.user?.role && (
              <p className="text-amber-400 text-xs mt-1">
                {session.user.role === "ARTIST" ? "🎭 Artiste" : "🏛️ Théâtre"}
              </p>
            )}
          </div>
          <div className="p-2">
            <Link
              href={getDashboardUrl()}
              className="block px-4 py-2 text-sm text-white hover:bg-amber-400/20 rounded-md"
              onClick={() => setShowMenu(false)}
            >
              {getDashboardLabel()}
            </Link>
            {session?.user?.role === "ARTIST" && (
              <Link
                href="/dashboard-artiste?tab=profile"
                className="block px-4 py-2 text-sm text-white hover:bg-amber-400/20 rounded-md"
                onClick={() => setShowMenu(false)}
              >
                Mon portfolio
              </Link>
            )}
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" })
                setShowMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-md"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
