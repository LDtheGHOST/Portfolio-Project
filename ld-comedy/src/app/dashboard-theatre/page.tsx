"use client"

import * as LucideIcons from "lucide-react"
import { Bell, Heart, MessageCircle, Trash2, User, Users } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

const Icons = LucideIcons as unknown as Record<string, React.ElementType>;

export default function DashboardTheatre() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("profile")
  const [notifications, setNotifications] = useState<any[]>([]);
  const [theaterProfileId, setTheaterProfileId] = useState<string | null>(null);

  // États pour les amis
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);

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
    } else if (status === "authenticated") {
      // Charger les notifications
      fetch("/api/theater/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch((err) => console.error("Erreur notifications:", err));

      // Charger le profil théâtre pour obtenir l'ID
      fetch("/api/theater/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile?.id) {
            setTheaterProfileId(data.profile.id);
          }
        })
        .catch((err) => console.error("Erreur profil:", err));

      // Charger les amis
      loadFriends();
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/theater/notifications")
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []));
    }
  }, [status]);

  // Fonction pour charger les amis
  const loadFriends = async () => {
    setFriendsLoading(true);
    try {
      const response = await fetch('/api/favorite/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  // Fonction pour supprimer un ami
  const handleRemoveFriend = async (friend: any) => {
    const friendName = friend.name || friend.artist?.user?.name || 'cet ami';

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${friendName} de vos amis ?`)) {
      return;
    }

    setRemovingFriend(friend.id);
    try {
      let body: any = {};

      if (friend.type === 'artist') {
        body = { artistId: friend.id };
      }

      const response = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        loadFriends(); // Recharger la liste
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setRemovingFriend(null);
    }
  };

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

  // Sidebar items restreints - on va les construire dynamiquement pour inclure le profil public
  const sidebarCategories = [
    {
      category: "Navigation",
      items: [
        { id: "home", label: "Retour au site", icon: Icons["Home"], path: "/", isExternal: true },
        ...(theaterProfileId ? [{ id: "public-profile", label: "Mon profil public", icon: Icons["Eye"], path: `/theatre/${theaterProfileId}`, highlight: true }] : []),
      ]
    },
    {
      category: "Mon espace",
      items: [
        { id: "overview", label: "Vue d'ensemble", icon: Icons["LayoutDashboard"], path: "/dashboard-theatre" },
        { id: "profile", label: "Mon profil", icon: Icons["User"], path: "/dashboard-theatre/profil" },
        { id: "affiches", label: "Affiches", icon: Icons["Image"], path: "/dashboard-theatre/affiches" },
        { id: "partnership", label: "Partenariats", icon: Icons["Handshake"], path: "/dashboard-theatre/partenariat" },
        { id: "contact", label: "Messages", icon: Icons["Mail"], path: "/dashboard-theatre/contact" },
        { id: "documents", label: "Documents", icon: Icons["FileText"], path: "/dashboard-theatre/documents" },
        { id: "settings", label: "Paramètres", icon: Icons["Settings"], path: "/dashboard-theatre/parametres" },
      ]
    }
  ];

  const Building2 = Icons["Building2"]
  const Plus = Icons["Plus"]
  const LogOut = Icons["LogOut"]
  const Star = Icons["Star"]
  const Calendar = Icons["Calendar"]

  return (
    <div className="fixed inset-0 bg-black text-white overflow-auto">
      {/* Sidebar */}
      <div className="fixed bottom-0 w-full md:top-0 md:w-64 md:h-full bg-gray-900 border-t md:border-r border-amber-400/20 z-50">
        <div className="flex flex-col h-full">
          {/* Logo et bouton retour - Desktop uniquement */}
          <div className="hidden md:block">
            <div className="flex items-center px-6 py-4 border-b border-amber-400/20">
              {React.createElement(Building2, { className: "w-6 h-6 text-amber-400" })}
              <span className="text-xl font-bold text-amber-400 ml-2">Espace Théâtre</span>
            </div>

          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="hidden md:block p-4 space-y-6">
              {sidebarCategories.map((category) => (
                <div key={category.category}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      const isHighlighted = (item as any).highlight
                      const isExternal = (item as any).isExternal
                      return (
                        <Link
                          key={item.id}
                          href={item.path}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isExternal
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg"
                              : isHighlighted
                              ? "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20"
                              : activeSection === item.id
                              ? "bg-amber-400/20 text-amber-400 border-l-4 border-amber-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-amber-300 hover:translate-x-1"
                          }`}
                        >
                          <div className="flex items-center">
                            {React.createElement(Icon, { className: `w-5 h-5 mr-3 ${isExternal ? 'animate-pulse' : ''}` })}
                            <span className="font-medium">{item.label}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Version mobile - Navigation en bas */}
            <div className="md:hidden flex justify-around items-center bg-gray-900/95 backdrop-blur-sm py-2">
              {/* Bouton retour au site */}
              <Link
                href="/"
                className="flex flex-col items-center p-2 text-sm font-medium"
              >
                {React.createElement(Icons["Home"], { className: "w-5 h-5 text-purple-400" })}
                <span className="text-[10px] mt-1 text-purple-400 font-semibold">Site</span>
              </Link>

              {/* Bouton Vue d'ensemble */}
              <Link
                href="/dashboard-theatre"
                className="flex flex-col items-center p-2 text-sm font-medium"
              >
                {React.createElement(Icons["LayoutDashboard"], { className: "w-5 h-5 text-gray-400" })}
                <span className="text-[10px] mt-1 text-gray-400">Accueil</span>
              </Link>

              {/* Profil public si disponible, sinon Profil normal */}
              {theaterProfileId ? (
                <Link
                  href={`/theatre/${theaterProfileId}`}
                  className="flex flex-col items-center p-2 text-sm font-medium"
                >
                  {React.createElement(Icons["Eye"], { className: "w-5 h-5 text-amber-400" })}
                  <span className="text-[10px] mt-1 text-amber-400 font-semibold">Public</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard-theatre/profil"
                  className="flex flex-col items-center p-2 text-sm font-medium"
                >
                  {React.createElement(Icons["User"], { className: "w-5 h-5 text-gray-400" })}
                  <span className="text-[10px] mt-1 text-gray-400">Profil</span>
                </Link>
              )}

              {/* Affiches */}
              <Link
                href="/dashboard-theatre/affiches"
                className="flex flex-col items-center p-2 text-sm font-medium"
              >
                {React.createElement(Icons["Image"], { className: "w-5 h-5 text-gray-400" })}
                <span className="text-[10px] mt-1 text-gray-400">Affiches</span>
              </Link>

              {/* Messages */}
              <Link
                href="/dashboard-theatre/contact"
                className="flex flex-col items-center p-2 text-sm font-medium"
              >
                {React.createElement(Icons["Mail"], { className: "w-5 h-5 text-gray-400" })}
                <span className="text-[10px] mt-1 text-gray-400">Messages</span>
              </Link>
            </div>
          </nav>

          {/* Section utilisateur et déconnexion - Desktop uniquement */}
          <div className="hidden md:block p-4 border-t border-amber-400/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                <span className="text-amber-400 font-medium">{session?.user?.name?.[0] || "T"}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400">Théâtre</p>
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
      </div>

      {/* Contenu principal */}
      <div className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* En-tête */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-amber-400">Mon Espace</h1>
              <p className="text-sm text-gray-400">Bienvenue, {session?.user?.name}</p>
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center gap-2">
              {theaterProfileId && (
                <Link
                  href={`/theatre/${theaterProfileId}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Voir mon profil</span>
                  <span className="md:hidden">Profil</span>
                </Link>
              )}
              <button
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl shadow-lg transition-all duration-300 text-sm md:text-base flex items-center gap-2"
              >
                {React.createElement(Plus, { className: "w-5 h-5" })}
                <span className="hidden sm:inline">Nouvel événement</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="px-4 py-6">
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
                  <img src={notif.posterImage} alt="Affiche" className="w-12 h-12 rounded-lg object-cover border border-amber-400/20" />
                  {notif.user?.profileImage ? (
                    <img src={notif.user.profileImage} alt={notif.user.name} className="w-8 h-8 rounded-full object-cover border border-amber-400/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">{notif.user?.name?.[0] || "?"}</div>
                  )}
                  <div className="flex-1">
                    <div className="text-white font-semibold">
                      {notif.type === "like" ? (
                        <span className="flex items-center gap-1 text-amber-400"><Heart className="w-4 h-4" /> {notif.user.name} a liké une affiche</span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-300"><MessageCircle className="w-4 h-4" /> {notif.user.name} a commenté : <span className="italic text-gray-200">"{notif.text}"</span></span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
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
                </div>              ))}
            </div>
          </div>          {/* SECTION MES AMIS ARTISTES */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-amber-400/30 shadow-xl hover:shadow-amber-400/20 transition-shadow">
            <div className="p-6 md:p-8 border-b border-amber-400/20">
              <h2 className="text-xl md:text-2xl font-bold text-amber-300 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" /> Mes Amis Artistes
              </h2>
            </div>

            {friendsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <span className="text-amber-400">Chargement des amis...</span>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucun artiste ami</p>
                <p className="text-gray-500 text-sm">Connectez-vous avec des artistes pour développer votre réseau</p>
              </div>
            ) : (
              <div className="divide-y divide-amber-400/20">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-6 md:p-8 hover:bg-black/30 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {friend.profileImage ? (
                        <img
                          src={friend.profileImage}
                          alt={friend.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/30 shadow-lg"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-lg border-2 border-amber-400/30">
                          {friend.name?.[0] || "A"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{friend.name}</h3>
                        <p className="text-amber-200 text-sm">
                          {friend.specialties?.length > 0 ? friend.specialties.join(', ') : 'Artiste comédien'}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Ami depuis le {new Date(friend.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFriend(friend)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50 group"
                      disabled={removingFriend === friend.id}
                      title="Supprimer cet ami"
                    >
                      {removingFriend === friend.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        </main>
      </div>
    </div>
  )
}
