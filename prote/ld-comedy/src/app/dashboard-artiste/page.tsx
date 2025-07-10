"use client"

import { useAuth } from "@/hooks/use-auth"
import { RoleGuard } from "@/components/auth/role-guard"
import { UserBadge } from "@/components/auth/user-profile"
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
  Users,
  Trash2,
} from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

export default function DashboardArtiste() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("overview")
  const [notifications, setNotifications] = useState<any[]>([])
  const [showPosterModal, setShowPosterModal] = useState(false)
  const [posterImage, setPosterImage] = useState<string>("")
  const [posterDescription, setPosterDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [artistProfileId, setArtistProfileId] = useState<string | null>(null);  // États pour les amis
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);
  // États pour les données dynamiques
  const [stats, setStats] = useState([
    { title: "Spectacles donnés", value: "0", icon: Mic },
    { title: "Note moyenne", value: "0", icon: Star },
    { title: "Vues du profil", value: "0", icon: User },
    { title: "Messages reçus", value: "0", icon: MessageSquare },
  ]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  useEffect(() => {
    if (user) {
      // Charger les notifications
      fetch("/api/artist/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch((err) => console.error("Erreur notifications:", err));

      // Récupérer l'ID du profil artiste
      fetch("/api/artist/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile?.id) {
            setArtistProfileId(data.profile.id);
          }
        })
        .catch((err) => console.error("Erreur profil artiste:", err));
        // Charger les statistiques
      loadStats();
      
      // Charger les amis
      loadFriends();

      // Charger le nombre de messages non lus
      loadUnreadMessages();

      // Écouter les nouveaux messages en temps réel (optionnel avec WebSocket)
      // Pour l'instant, on va utiliser un polling toutes les 30 secondes
      const messageInterval = setInterval(() => {
        loadUnreadMessages();
        loadNotifications();
      }, 30000);

      return () => clearInterval(messageInterval);
    }
  }, [user])
  
  // Utiliser l'ID du profil artiste au lieu de l'ID utilisateur  const artistId = artistProfileId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400">Chargement...</div>
      </div>
    )
  }

  return (
    <RoleGuard
      requiredRoles={["ARTIST", "ADMIN"]}
      fallback={
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
            <p className="text-gray-400">Vous devez être un artiste pour accéder à cette page.</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </RoleGuard>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState("overview")
  const [notifications, setNotifications] = useState<any[]>([])
  const [showPosterModal, setShowPosterModal] = useState(false)
  const [posterImage, setPosterImage] = useState<string>("")
  const [posterDescription, setPosterDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [artistProfileId, setArtistProfileId] = useState<string | null>(null)
  // États pour les amis
  const [friends, setFriends] = useState<any[]>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [removingFriend, setRemovingFriend] = useState<string | null>(null)
  // États pour les données dynamiques
  const [stats, setStats] = useState([
    { title: "Spectacles donnés", value: "0", icon: Mic },
    { title: "Note moyenne", value: "0", icon: Star },
    { title: "Vues du profil", value: "0", icon: User },
    { title: "Messages reçus", value: "0", icon: MessageSquare },
  ])
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (user) {
      // Charger les notifications
      fetch("/api/artist/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch((err) => console.error("Erreur notifications:", err));

      // Récupérer l'ID du profil artiste
      fetch("/api/artist/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile?.id) {
            setArtistProfileId(data.profile.id);
          }
        })
        .catch((err) => console.error("Erreur profil artiste:", err));
        // Charger les statistiques
      loadStats();
      
      // Charger les amis
      loadFriends();

      // Charger le nombre de messages non lus
      loadUnreadMessages();

      // Écouter les nouveaux messages en temps réel (optionnel avec WebSocket)
      // Pour l'instant, on va utiliser un polling toutes les 30 secondes
      const messageInterval = setInterval(() => {
        loadUnreadMessages();
        loadNotifications();
      }, 30000);

      return () => clearInterval(messageInterval);
    }
  }, [user])

  const artistId = artistProfileId;

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
    },    {
      category: "Communication",
      items: [
        { 
          id: "RS", 
          label: "Messagerie", 
          icon: MessageSquare, 
          path: "/dashboard-artiste/reseaux",
          badge: unreadMessages > 0 ? unreadMessages : null
        },
      ],
    },
    {
      category: "Paramètres",
      items: [
        { id: "settings", label: "Paramètres", icon: Settings, path: "/dashboard-artiste/settings" },
      ],    },
  ]

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
    const friendName = friend.name || friend.theater?.user?.name || 'cet ami';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${friendName} de vos amis ?`)) {
      return;
    }

    setRemovingFriend(friend.id);
    try {
      let body: any = {};
      
      if (friend.type === 'theater') {
        const theaterId = friend.theater?.id || friend.id;
        body = { theaterId };
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

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/artist/stats');
      if (response.ok) {
        const data = await response.json();
        setStats([
          { title: "Spectacles donnés", value: data.totalShows?.toString() || "0", icon: Mic },
          { title: "Note moyenne", value: data.averageRating?.toFixed(1) || "0", icon: Star },
          { title: "Vues du profil", value: data.profileViews?.toString() || "0", icon: User },
          { title: "Messages reçus", value: data.totalMessages?.toString() || "0", icon: MessageSquare },
        ]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }  };

  // Fonction pour charger les messages non lus
  const loadUnreadMessages = async () => {
    try {
      const response = await fetch('/api/messages/unread-count');      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.count || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages non lus:', error);
    }
  };  // Fonction pour charger les notifications
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/artist/notifications');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.error('Erreur API notifications:', response.status, response.statusText);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      setNotifications([]);
    }
  };

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
                  <div className="space-y-1">                    {category.items.map((item) => {
                      const Icon = item.icon
                      const hasNotifications = (item as any).badge
                      return (
                        <Link
                          key={item.id}
                          href={item.path}
                          className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeSection === item.id
                              ? "bg-amber-400/20 text-amber-400"
                              : "text-gray-400 hover:bg-gray-800 hover:text-amber-400"
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                          </div>
                          {hasNotifications && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {hasNotifications > 99 ? "99+" : hasNotifications}
                            </span>
                          )}
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
                <span className="text-amber-400 font-medium">{user?.name?.[0] || "A"}</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium truncate">{user?.name}</p>
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
      <div className="md:ml-64 min-h-screen pb-20 md:pb-0">        {/* En-tête */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-amber-400">
                {sidebarItems.flatMap((category) => category.items).find((item) => item.id === activeSection)
                  ?.label || "Mon Espace"}
              </h1>
              <p className="text-sm text-gray-400">Bienvenue, {user?.name}</p>
            </div>

            {/* Indicateur de notifications */}
            <div className="flex items-center gap-3">
              {(notifications.length > 0 || unreadMessages > 0) && (
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                      <Bell className="w-4 h-4" />
                      <span>{notifications.length}</span>
                    </div>
                  )}
                  {unreadMessages > 0 && (
                    <Link
                      href="/dashboard-artiste/reseaux"
                      className="flex items-center gap-1 text-green-400 text-sm hover:text-green-300 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{unreadMessages}</span>
                    </Link>
                  )}
                </div>
              )}

              <button
                className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
                onClick={() => setShowPosterModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Nouvelle affiche</span>
              </button>
            </div>
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
                  setUploadError("");
                  try {
                    // Upload image sur Cloudinary ou autre (ici on suppose un champ URL direct)
                    // Pour une vraie intégration Cloudinary, il faudrait un composant dédié
                    if (!posterImage) throw new Error("Merci de fournir l'URL de l'image de l'affiche.")
                    if (!artistId) throw new Error("Profil artiste non trouvé. Veuillez recharger la page.")
                    
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
        )}        {/* Contenu */}
        <main className="p-4">
          {/* SECTION NOTIFICATIONS */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-amber-300 flex items-center gap-2">
                <Bell className="w-6 h-6 text-amber-400" /> 
                Notifications 
                {notifications.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {notifications.length}
                  </span>
                )}
              </h2>
              {notifications.length > 5 && (
                <button
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  {showAllNotifications ? "Voir moins" : "Voir tout"}
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-center py-8 bg-gray-900/30 rounded-xl border border-amber-400/10">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Aucune notification récente</p>
                <p className="text-gray-500">Vous serez notifié des likes, commentaires et messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showAllNotifications ? notifications : notifications.slice(0, 5)).map((notif, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-black/40 rounded-xl p-4 border border-amber-400/10 hover:border-amber-400/20 transition-colors">
                    {/* Icône du type de notification */}
                    <div className="flex-shrink-0">
                      {notif.type === "like" ? (
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-red-400" />
                        </div>
                      ) : notif.type === "comment" ? (
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-blue-400" />
                        </div>
                      ) : notif.type === "message" ? (
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-amber-400" />
                        </div>
                      )}
                    </div>

                    {/* Image de l'affiche ou de l'utilisateur */}
                    <div className="flex-shrink-0">
                      {notif.posterImage ? (
                        <img
                          src={notif.posterImage}
                          alt="Affiche"
                          className="w-12 h-12 rounded-lg object-cover border border-amber-400/20"
                        />
                      ) : notif.user?.profileImage ? (
                        <img
                          src={notif.user.profileImage}
                          alt={notif.user.name}
                          className="w-12 h-12 rounded-full object-cover border border-amber-400/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                          {notif.user?.name?.[0] || "?"}
                        </div>
                      )}
                    </div>

                    {/* Contenu de la notification */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium">
                        {notif.type === "like" && (
                          <span className="text-red-400">
                            {notif.user?.name} a aimé votre affiche
                          </span>
                        )}
                        {notif.type === "comment" && (
                          <div>
                            <span className="text-blue-400">{notif.user?.name} a commenté :</span>
                            <p className="text-gray-300 italic mt-1 truncate">"{notif.text}"</p>
                          </div>
                        )}
                        {notif.type === "message" && (
                          <div>
                            <span className="text-green-400">Nouveau message de {notif.user?.name}</span>
                            <p className="text-gray-300 mt-1 truncate">{notif.text}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                        <span>{new Date(notif.createdAt || notif.date).toLocaleString()}</span>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {notif.type === "message" && (
                      <div className="flex-shrink-0">
                        <Link
                          href="/dashboard-artiste/reseaux"
                          className="bg-amber-400 hover:bg-amber-500 text-black px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Répondre
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION MES AMIS THÉÂTRES */}
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" /> Mes Amis Théâtres
            </h2>
            {friendsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                <span className="text-amber-400">Chargement des amis...</span>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 bg-gray-900/30 rounded-xl border border-amber-400/10">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucun théâtre ami</p>
                <p className="text-gray-500">Commencez à vous connecter avec des théâtres pour développer votre réseau</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-amber-400/10 hover:border-amber-400/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {friend.theater?.user?.profileImage ? (
                        <img
                          src={friend.theater.user.profileImage}
                          alt={friend.theater.user.name}
                          className="w-12 h-12 rounded-lg object-cover border border-amber-400/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                          {friend.theater?.user?.name?.[0] || friend.name?.[0] || "T"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {friend.theater?.user?.name || friend.name || 'Théâtre'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Théâtre partenaire • Ajouté le {new Date(friend.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFriend(friend)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
                      disabled={removingFriend === friend.id}
                      title="Supprimer de mes amis"
                    >
                      {removingFriend === friend.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
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
            })}          </div>
        </main>
      </div>
    </div>
  )
}