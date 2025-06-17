"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import * as LucideIcons from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import React from "react"

const Icons = LucideIcons as unknown as Record<string, React.ElementType>;

export default function DashboardTheatre() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("profile")

  // Données pour les artistes en vedette
  const featuredArtists = [
    { name: "Marie Dubois", role: "Comédienne", status: "Disponible", rating: 4.8 },
    { name: "Jean Martin", role: "Humoriste", status: "En spectacle", rating: 4.9 },
    { name: "Sophie Laurent", role: "Metteuse en scène", status: "Disponible", rating: 4.7 },
  ]

  // Données pour les événements à venir
  const upcomingEvents = [
    {
      title: "Le Misanthrope",
      artist: "Troupe Classique",
      date: "25 Déc 2024",
      time: "20:00",
      status: "Confirmé",
    },
    {
      title: "One-man-show Comedy",
      artist: "Jean Martin",
      date: "26 Déc 2024",
      time: "19:30",
      status: "En attente",
    },
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/connexion")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Sidebar items restreints
  const sidebarItems = [
    { id: "home", label: "Retour à l'accueil", icon: "ArrowLeft", path: "/" },
    { id: "profile", label: "Profil", icon: "Home", path: "/dashboard-theatre/profil" },
    { id: "partnership", label: "Partenariat", icon: "Users", path: "/dashboard-theatre/partenariat" },
    { id: "contact", label: "Contact", icon: "Mail", path: "/dashboard-theatre/contact" },
    { id: "documents", label: "Documents", icon: "FileText", path: "/dashboard-theatre/documents" },
    { id: "settings", label: "Paramètres", icon: "Settings", path: "/dashboard-theatre/parametres" },
  ]

  // Pour les icônes du header et des sections
  const Building2 = Icons["Building2"]
  const Plus = Icons["Plus"]
  const LogOut = Icons["LogOut"]
  const Star = Icons["Star"]
  const Calendar = Icons["Calendar"]

  return (
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-black via-[#2d0b18] to-[#3a1c4d] text-white overflow-auto">
      {/* Header principal */}
      <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-md shadow-lg border-b border-amber-400/30">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
          <div className="flex items-center space-x-4">
            {React.createElement(Building2, { className: "w-8 h-8 md:w-9 md:h-9 text-amber-400 drop-shadow-lg" })}
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
              Théâtre Dashboard
            </span>
          </div>
          <button
            className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg transition-all duration-300 text-base md:text-lg flex items-center gap-2"
          >
            {React.createElement(Plus, { className: "w-5 h-5" })}
            <span className="hidden sm:inline">Nouvel événement</span>
          </button>
        </div>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:bg-black/70 md:border-r md:border-amber-400/20 md:shadow-lg md:flex md:flex-col z-40">
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-6 border-b border-amber-400/20">
            {React.createElement(Building2, { className: "w-7 h-7 text-amber-400" })}
            <span className="text-xl font-bold text-amber-400 ml-2">Mon Théâtre</span>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-8">
            <div>
              {/* TITRE NAVIGATION */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Navigation</h3>
              <div className="space-y-1 mb-6">
                {(() => {
                  const item = sidebarItems[0];
                  const Icon = Icons[item.icon];
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 group ${
                        activeSection === item.id
                          ? "bg-amber-400/30 text-amber-400 shadow-lg"
                          : item.id === "home"
                            ? "text-gray-400 hover:bg-amber-400/10 hover:text-amber-300 border-b border-amber-400/10 mb-2"
                            : "text-gray-300 hover:bg-amber-400/10 hover:text-amber-300"
                      }`}
                    >
                      {React.createElement(Icon, { className: "w-5 h-5 mr-3 group-hover:scale-110 transition-transform" })}
                      {item.label}
                    </Link>
                  );
                })()}
              </div>
              {/* TITRE MON ESPACE */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-1">Mon espace</h3>
              <div className="space-y-1">
                {sidebarItems.slice(1).map((item) => {
                  const Icon = Icons[item.icon];
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-all duration-200 group ${
                        activeSection === item.id
                          ? "bg-amber-400/30 text-amber-400 shadow-lg"
                          : "text-gray-300 hover:bg-amber-400/10 hover:text-amber-300"
                      }`}
                    >
                      {React.createElement(Icon, { className: "w-5 h-5 mr-3 group-hover:scale-110 transition-transform" })}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
          <div className="p-4 border-t border-amber-400/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                <span className="text-amber-400 font-medium text-lg">{session.user?.name?.[0] || "T"}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400">Administrateur</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              {React.createElement(LogOut, { className: "w-5 h-5 mr-3" })}
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile (scrollable horizontal nav) */}
      <nav className="md:hidden flex w-full overflow-x-auto bg-black/70 border-b border-amber-400/20 shadow-lg z-30">
        <div className="flex space-x-2 px-2 py-2">
          {/* TITRE NAVIGATION MOBILE */}
          <div className="flex flex-col items-center justify-center mr-2">
            <span className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Navigation</span>
            {(() => {
              const item = sidebarItems[0];
              const Icon = Icons[item.icon];
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`flex flex-col items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 group ${
                    activeSection === item.id
                      ? "bg-amber-400/30 text-amber-400 shadow"
                      : item.id === "home"
                        ? "text-gray-400 hover:bg-amber-400/10 hover:text-amber-300 border-b border-amber-400/10 mb-2"
                        : "text-gray-300 hover:bg-amber-400/10 hover:text-amber-300"
                  }`}
                >
                  {React.createElement(Icon, { className: "w-5 h-5 mb-1 group-hover:scale-110 transition-transform" })}
                  {item.label}
                </Link>
              );
            })()}
          </div>
          {/* TITRE MON ESPACE MOBILE */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Mon espace</span>
            <div className="flex space-x-2">
              {sidebarItems.slice(1).map((item) => {
                const Icon = Icons[item.icon];
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`flex flex-col items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 group ${
                      activeSection === item.id
                        ? "bg-amber-400/30 text-amber-400 shadow"
                        : "text-gray-300 hover:bg-amber-400/10 hover:text-amber-300"
                    }`}
                  >
                    {React.createElement(Icon, { className: "w-5 h-5 mb-1 group-hover:scale-110 transition-transform" })}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0 px-2 md:px-12 pt-6 md:pt-8">
        <section className="space-y-8">
          {/* Artistes en vedette */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-amber-400/30 p-6 md:p-8 shadow-xl hover:shadow-amber-400/20 transition-shadow">
            <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-6 tracking-tight flex items-center gap-2">
              {React.createElement(Star, { className: "w-6 h-6 text-amber-400" })} Artistes en vedette
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredArtists.map((artist) => (
                <div
                  key={artist.name}
                  className="bg-black/60 rounded-xl p-4 md:p-6 flex flex-col items-start shadow-lg border border-amber-400/10 hover:scale-105 hover:shadow-amber-400/30 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-semibold text-white">{artist.name}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-400/20 text-amber-300 font-medium">
                      {artist.role}
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      artist.status === "Disponible"
                        ? "bg-green-400/20 text-green-400"
                        : "bg-amber-400/20 text-amber-400"
                    }`}
                  >
                    {artist.status}
                  </span>
                  <div className="flex items-center mt-4">
                    {React.createElement(Star, { className: "w-4 h-4 text-amber-400" })}
                    <span className="ml-1 text-base text-amber-300 font-bold">{artist.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Événements à venir */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-amber-400/30 shadow-xl hover:shadow-amber-400/20 transition-shadow">
            <div className="p-6 md:p-8 border-b border-amber-400/20">
              <h2 className="text-xl md:text-2xl font-bold text-amber-300 flex items-center gap-2">
                {React.createElement(Calendar, { className: "w-6 h-6 text-amber-400" })} Événements à venir
              </h2>
            </div>
            <div className="divide-y divide-amber-400/20">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="p-6 md:p-8 hover:bg-black/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-white text-lg">{event.title}</h3>
                    <p className="text-sm text-amber-200">{event.artist}</p>
                    <p className="text-sm text-gray-300">
                      {event.date} à {event.time}
                    </p>
                  </div>
                  <span
                    className={`mt-2 md:mt-0 px-4 py-2 rounded-full text-base font-semibold shadow-md ${
                      event.status === "Confirmé"
                        ? "bg-green-400/20 text-green-400"
                        : "bg-amber-400/20 text-amber-400"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
