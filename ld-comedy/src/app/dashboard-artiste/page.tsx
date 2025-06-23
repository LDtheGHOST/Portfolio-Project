"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import {
  Home,
  Calendar,
  User,
  MessageSquare,
  FileText,
  ImageIcon,
  Settings,
  LogOut,
  Plus,
  Star,
  Ticket,
  Mail,
  Video,
  ArrowLeft,
  Mic,
  Bell,
  Heart,
  MessageCircle,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function DashboardArtiste() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")

  // Données pour les spectacles à venir
  const upcomingShows = [
    {
      title: "One-man-show",
      venue: "Théâtre de la Ville",
      date: "25 Déc 2024",
      time: "20:00",
      status: "Confirmé",
    },
    {
      title: "Soirée Comedy Club",
      venue: "Le Point Virgule",
      date: "26 Déc 2024",
      time: "19:30",
      status: "En attente",
    },
  ]

  // Statistiques de l'artiste
  const stats = [
    { title: "Spectacles donnés", value: "24", icon: Mic },
    { title: "Note moyenne", value: "4.8", icon: Star },
    { title: "Vues du profil", value: "1.2k", icon: User },
    { title: "Messages reçus", value: "45", icon: MessageSquare },
  ]

  const [notifications, setNotifications] = useState<any[]>([])
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/artist/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
    }
  }, [status])

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

  const sidebarItems = [
    {
      category: "Général",
      items: [
        { id: "overview", label: "Mon Espace", icon: Home, path: "/dashboard-artiste" },
        { id: "profile", label: "Mon Histoire", icon: User, path: "/dashboard-artiste/profile" },
      ],
    },
    {
      category: "Contenu Artistique",
      items: [
        { id: "gallery", label: "Galerie Photos", icon: ImageIcon, path: "/dashboard-artiste/gallery" },
        { id: "documents", label: "Documents", icon: FileText, path: "/dashboard-artiste/documents" },
      ],
    },
    {
      category: "Communication",
      items: [
        { id: "RS", label: "Réseaux Sociaux", icon: MessageSquare, path: "/dashboard-artiste/reseaux" },
      ],
    },
    {
      category: "Paramètres",
      items: [
        { id: "settings", label: "Paramètres", icon: Settings, path: "/dashboard-artiste/settings" },
      ],
    },
  ]

  const [showPosterModal, setShowPosterModal] = useState(false)
  const [posterImage, setPosterImage] = useState<string>("")
  const [posterDescription, setPosterDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Récupérer l'artistId du session.user (si stocké dans le token)
  // Sinon, il faudra le fetcher côté serveur ou via un endpoint
  const artistId = session?.user?.artistProfileId // à adapter selon la structure du token

  return (
    <div className="fixed inset-0 bg-black text-white overflow-auto">
      {/* Sidebar */}
      <div className="fixed bottom-0 w-full md:top-0 md:w-64 md:h-full bg-gray-900 border-t md:border-r border-amber-400/20 z-50">
        <div className="flex flex-col h-full">
          {/* Logo et bouton retour */}
          <div className="hidden md:block">
            <div className="flex items-center px-6 py-4 border-b border-amber-400/20">
              <Mic className="w-6 h-6 text-amber-400" />
              <span className="text-xl font-bold text-amber-400 ml-2">Espace Artiste</span>
            </div>

            {/* Bouton retour à l'accueil */}
            <div className="p-4 border-b border-amber-400/20">
              <Link
                href="/"
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-3 group-hover:text-amber-400" />
                <span>Retour à l'accueil</span>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="hidden md:block p-4 space-y-6">
              {sidebarItems.map((category) => (
                <div key={category.category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.id}
                          href={item.path}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeSection === item.id
                              ? "bg-amber-400/20 text-amber-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-amber-400"
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Version mobile */}
            <div className="md:hidden flex justify-around">
              {sidebarItems
                .flatMap((category) => category.items)
                .slice(0, 4)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.id} href={item.path} className="flex flex-col items-center p-3 text-sm font-medium">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-xs mt-1 text-gray-400">{item.label}</span>
                    </Link>
                  )
                })}
            </div>
          </nav>

          {/* Section utilisateur et déconnexion */}
          <div className="hidden md:block p-4 border-t border-amber-400/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                <span className="text-amber-400 font-medium">{session.user?.name?.[0] || "A"}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400">Artiste</p>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* En-tête */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-xl font-bold text-amber-400">
                {sidebarItems.flatMap((category) => category.items).find((item) => item.id === activeSection)
                  ?.label || "Mon Espace"}
              </h1>
              <p className="text-sm text-gray-400">Bienvenue, {session?.user?.name}</p>
            </div>

            <button
              className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={() => setShowPosterModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Nouvelle affiche</span>
            </button>
          </div>
        </header>

        {/* MODALE UPLOAD AFFICHE */}
        {showPosterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-amber-400/30 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-amber-400"
                onClick={() => setShowPosterModal(false)}
              >
                ×
              </button>
              <h2 className="text-lg font-bold text-amber-400 mb-4">Uploader une affiche</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setUploading(true)
                  setUploadError("")
                  try {
                    // Upload image sur Cloudinary ou autre (ici on suppose un champ URL direct)
                    // Pour une vraie intégration Cloudinary, il faudrait un composant dédié
                    if (!posterImage) throw new Error("Merci de fournir l'URL de l'image de l'affiche.")
                    const res = await fetch("/api/poster", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        imageUrl: posterImage,
                        description: posterDescription,
                        artistId: artistId,
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload")
                    setShowPosterModal(false)
                    setPosterImage("")
                    setPosterDescription("")
                    // Optionnel: afficher un toast ou rafraîchir la galerie
                  } catch (err: any) {
                    setUploadError(err.message)
                  } finally {
                    setUploading(false)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Image (URL)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-amber-400/20 text-white"
                    placeholder="https://..."
                    value={posterImage}
                    onChange={(e) => setPosterImage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-amber-400/20 text-white"
                    placeholder="Description de l'affiche"
                    value={posterDescription}
                    onChange={(e) => setPosterDescription(e.target.value)}
                  />
                </div>
                {uploadError && <div className="text-red-400 text-sm">{uploadError}</div>}
                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  {uploading ? "Envoi..." : "Uploader"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Contenu */}
        <main className="p-4">
          {/* SECTION NOTIFICATIONS */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400" /> Notifications
            </h2>
            {notifications.length === 0 ? (
              <div className="text-gray-400">Aucune notification récente.</div>
            ) : (
              <ul className="space-y-3">
                {notifications.slice(0, 10).map((notif, idx) => (
                  <li key={idx} className="flex items-center gap-4 bg-black/40 rounded-xl p-3 border border-amber-400/10">
                    <img
                      src={notif.posterImage}
                      alt="Affiche"
                      className="w-12 h-12 rounded-lg object-cover border border-amber-400/20"
                    />
                    {notif.user?.profileImage ? (
                      <img
                        src={notif.user.profileImage}
                        alt={notif.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-amber-400/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                        {notif.user?.name?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-white font-semibold">
                        {notif.type === "like" ? (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Heart className="w-4 h-4" /> {notif.user.name} a liké une affiche
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-300">
                            <MessageCircle className="w-4 h-4" /> {notif.user.name} a commenté :{" "}
                            <span className="italic text-gray-200">"{notif.text}"</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notif.date).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.title}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-400/20"
                >
                  <Icon className="w-8 h-8 text-amber-400 mb-2" />
                  <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                  <p className="text-gray-400">{stat.title}</p>
                </div>
              )
            })}
          </div>

          {/* Spectacles à venir */}
          <div className="bg-gray-900/50 rounded-lg border border-amber-400/20">
            <div className="p-4 border-b border-amber-400/20">
              <h2 className="text-lg font-semibold text-amber-400">Spectacles à venir</h2>
            </div>
            <div className="divide-y divide-amber-400/20">
              {upcomingShows.map((show) => (
                <div key={show.title} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-white">{show.title}</h3>
                      <p className="text-sm text-gray-400">{show.venue}</p>
                      <p className="text-sm text-gray-400">
                        {show.date} à {show.time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        show.status === "Confirmé"
                          ? "bg-green-400/20 text-green-400"
                          : "bg-amber-400/20 text-amber-400"
                      }`}
                    >
                      {show.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}