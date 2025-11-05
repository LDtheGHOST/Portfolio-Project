"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Clock, Check, X, Home, Trash2, MessageCircle } from "lucide-react";

interface Friend {
  id: string;
  status: string;
  type?: string;
  name?: string;
  profileImage?: string;  // Pour les structures d'API existantes
  artist?: {
    id: string;
    artisticName?: string;
    profileImage?: string;
    userId?: string;
    user?: {
      id: string;
      name: string;
      profileImage?: string;
    };
  };
  theater?: {
    id: string;
    name?: string;
    theaterName?: string;
    logo?: string;
    userId?: string;
    user?: {
      id: string;
      name: string;
      profileImage?: string;
    };
  };
  createdAt: string;
}

export default function MesAmisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [removingFriend, setRemovingFriend] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/connexion");
      return;
    }

    loadFriends();
    loadRequests();
  }, [session, status, router]);
  const loadFriends = async () => {
    try {
      console.log("Chargement des amis...");
      const response = await fetch('/api/favorite/friends');
      if (response.ok) {
        const data = await response.json();
        console.log("Données amis reçues:", data);
        setFriends(data.friends || []);
      } else {
        console.error("Erreur response amis:", response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    }
  };
  const loadRequests = async () => {
    try {
      console.log("Chargement des demandes...");
      const response = await fetch('/api/favorite/requests');
      if (response.ok) {
        const data = await response.json();
        console.log("Données demandes reçues:", data);
        setRequests(data.requests || []);
      } else {
        console.error("Erreur response demandes:", response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/favorite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          friendshipId,
          action: "accept"
        })
      });

      if (response.ok) {
        loadFriends();
        loadRequests();
      } else {
        console.error('Erreur lors de l\'acceptation:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/favorite/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          friendshipId,
          action: "reject"
        })
      });

      if (response.ok) {
        loadRequests();
      } else {
        console.error('Erreur lors du refus:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    }
  };
  const handleRemoveFriend = async (friend: Friend) => {
    // Détermine le nom pour la confirmation
    const friendName = friend.name || friend.artist?.user?.name || friend.theater?.user?.name || 'cet ami';
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${friendName} de vos amis ?`)) {
      return;
    }

    setRemovingFriend(friend.id);
    try {
      let body: any = {};
      
      console.log("Suppression ami - Données ami:", friend);
      
      if (friend.type === 'artist') {
        // L'ami est un artiste, on envoie son ID
        body = { artistId: friend.id };
      } else if (friend.type === 'theater') {
        // L'ami est un théâtre, on envoie son ID de théâtre
        const theaterId = friend.theater?.id || friend.id;
        body = { theaterId };
      } else if (friend.artist) {
        // Format alternatif avec objet artist
        body = { artistId: friend.artist.id };
      } else if (friend.theater) {
        // Format alternatif avec objet theater
        body = { theaterId: friend.theater.id };
      } else {
        console.error("Impossible de déterminer le type d'ami à supprimer:", friend);
        alert("Erreur: impossible de déterminer le type d'ami");
        return;
      }

      console.log("Suppression ami - Body envoyé:", body);

      const response = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Recharger la liste des amis
        loadFriends();
        const data = await response.json();
        console.log("Ami supprimé:", data.message);
      } else {
        const error = await response.json();
        console.error('Erreur lors de la suppression:', error);
        alert(error.error || 'Erreur lors de la suppression de l\'ami');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'ami');
    } finally {
      setRemovingFriend(null);
    }
  };
  // Démarrer une conversation avec un ami
  const startConversation = async (friend: Friend) => {
    try {
      let participantId = '';
      
      // Déterminer l'ID du participant selon le type d'ami
      if (friend.type === 'artist') {
        participantId = friend.id;
      } else if (friend.type === 'theater') {
        participantId = friend.id;
      } else if (friend.artist?.userId) {
        participantId = friend.artist.userId;
      } else if (friend.artist?.user?.id) {
        participantId = friend.artist.user.id;
      } else if (friend.theater?.userId) {
        participantId = friend.theater.userId;
      } else if (friend.theater?.user?.id) {
        participantId = friend.theater.user.id;
      } else {
        console.error("Impossible de déterminer l'ID du participant:", friend);
        alert("Erreur: impossible de démarrer la conversation");
        return;
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId })
      });

      if (response.ok) {
        // Rediriger vers la page de messagerie appropriée selon le rôle
        if (session?.user?.role === "ARTIST") {
          router.push("/dashboard-artiste/reseaux");
        } else if (session?.user?.role === "THEATER") {
          router.push("/dashboard-theatre/contact");
        }
      } else {
        const error = await response.json();
        console.error('Erreur lors de la création de la conversation:', error);
        alert(error.error || 'Erreur lors de la création de la conversation');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert('Erreur lors de la création de la conversation');
    }
  };

  const goToDashboard = () => {
    if (session?.user?.role === "ARTIST") {
      router.push("/dashboard-artiste");
    } else if (session?.user?.role === "THEATER") {
      router.push("/dashboard-theatre");
    } else {
      router.push("/choix-roles");
    }
  };
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-full blur-2xl"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-amber-400 border-r-orange-400 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium text-lg">Chargement de votre réseau...</p>
            <p className="text-gray-400 text-sm">Préparation de vos connexions professionnelles</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header amélioré */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600/95 via-orange-600/95 to-amber-700/95 backdrop-blur-md border-b border-amber-400/20 shadow-2xl">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.back()}
                className="group p-3 bg-black/30 hover:bg-black/50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                  Mon Réseau
                </h1>
                <p className="text-amber-100/80 text-sm mt-1">
                  Gérez vos connexions professionnelles
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href="/"
                className="group flex items-center space-x-2 px-4 py-2.5 bg-black/30 hover:bg-black/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
              <button
                onClick={goToDashboard}
                className="group flex items-center space-x-2 px-4 py-2.5 bg-black/30 hover:bg-black/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>

          {/* Navigation tabs avec style glassmorphism */}
          <div className="flex space-x-2 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
                activeTab === 'friends'
                  ? 'bg-white text-amber-600 shadow-lg transform scale-[1.02]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Mes Amis</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'friends' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-white/20 text-white/80'
                }`}>
                  {friends.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
                activeTab === 'requests'
                  ? 'bg-white text-amber-600 shadow-lg transform scale-[1.02]'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Demandes</span>
                {requests.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'requests' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {requests.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>      {/* Content amélioré */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {activeTab === 'friends' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Mes Connexions Professionnelles
                </h2>
                <p className="text-gray-400">
                  {friends.length > 0 
                    ? `${friends.length} connexion${friends.length > 1 ? 's' : ''} dans votre réseau`
                    : "Développez votre réseau professionnel"
                  }
                </p>
              </div>
              {friends.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-amber-400">{friends.length}</p>
                </div>
              )}
            </div>
            
            {friends.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
                  <Users className="relative w-20 h-20 text-gray-600 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Aucune connexion pour le moment</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Commencez à construire votre réseau en vous connectant avec des {session.user?.role === "ARTIST" ? "théâtres" : "artistes"} 
                  qui partagent votre passion pour le spectacle vivant.
                </p>
                <Link
                  href={session.user?.role === "ARTIST" ? "/theatre" : "/comediens"}
                  className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-600/25"
                >
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Découvrir des {session.user?.role === "ARTIST" ? "théâtres" : "artistes"}</span>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {friends.map((friend) => {
                  // ...existing code...
                  let displayName = '';
                  let displayImage = '';
                  let displayType = '';

                  if (friend.type === 'artist' && friend.name) {
                    displayName = friend.name;
                    displayImage = friend.profileImage || '';
                    displayType = 'Artiste';
                  } else if (friend.type === 'theater' && friend.theater) {
                    displayName = friend.theater.user?.name || friend.theater.theaterName || 'Théâtre';
                    displayImage = friend.theater.user?.profileImage || friend.theater.logo || '';
                    displayType = 'Théâtre';
                  } else if (friend.artist) {
                    displayName = friend.artist.user?.name || friend.artist.artisticName || 'Artiste';
                    displayImage = friend.artist.user?.profileImage || friend.artist.profileImage || '';
                    displayType = 'Artiste';
                  } else if (friend.theater) {
                    displayName = friend.theater.user?.name || friend.theater.theaterName || 'Théâtre';
                    displayImage = friend.theater.user?.profileImage || friend.theater.logo || '';
                    displayType = 'Théâtre';
                  }

                  return (
                    <div key={friend.id} className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-600/10 hover:scale-[1.02]">
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-600 group-hover:border-amber-400/50 transition-colors duration-300">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <Users className="w-7 h-7 text-gray-400 group-hover:text-amber-400 transition-colors duration-300" />
                              )}
                            </div>
                            {/* Indicateur de statut */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate group-hover:text-amber-100 transition-colors duration-300">
                              {displayName}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                displayType === 'Artiste' 
                                  ? 'bg-purple-500/20 text-purple-300' 
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {displayType}
                              </span>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium">
                                ● Connecté
                              </span>
                            </div>
                          </div>
                        </div>
                          <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => startConversation(friend)}
                            className="group/btn p-3 text-amber-400 hover:bg-amber-600/20 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Envoyer un message"
                          >
                            <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(friend)}
                            disabled={removingFriend === friend.id}
                            className="group/btn p-3 text-red-400 hover:bg-red-600/20 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
                            title="Supprimer cette connexion"
                          >
                            {removingFriend === friend.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                            ) : (
                              <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                            )}
                          </button>
                          {/* Bouton pour démarrer une conversation */}
                          <button
                            onClick={() => startConversation(friend)}
                            className="group/btn p-3 text-blue-400 hover:bg-blue-600/20 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Démarrer une conversation"
                          >
                            <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Demandes de Connexion
                </h2>
                <p className="text-gray-400">
                  {requests.length > 0 
                    ? `${requests.length} demande${requests.length > 1 ? 's' : ''} en attente de votre validation`
                    : "Aucune nouvelle demande"
                  }
                </p>
              </div>
              {requests.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">En attente</p>
                  <p className="text-2xl font-bold text-orange-400">{requests.length}</p>
                </div>
              )}
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                  <Clock className="relative w-20 h-20 text-gray-600 mx-auto mb-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Aucune demande en attente</h3>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                  Vous êtes à jour avec toutes vos demandes de connexion. 
                  Les nouvelles demandes apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {requests.map((request) => {
                  // ...existing code...
                  let displayName = '';
                  let displayImage = '';
                  let displayType = '';

                  if (request.artist) {
                    displayName = request.artist.user?.name || request.artist.artisticName || 'Artiste';
                    displayImage = request.artist.user?.profileImage || request.artist.profileImage || '';
                    displayType = 'Artiste';
                  } else if (request.theater) {
                    displayName = request.theater.user?.name || request.theater.theaterName || 'Théâtre';
                    displayImage = request.theater.user?.profileImage || request.theater.logo || '';
                    displayType = 'Théâtre';
                  }

                  return (
                    <div key={request.id} className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-6 rounded-2xl border border-orange-500/30 backdrop-blur-sm hover:border-orange-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-600/10 hover:scale-[1.02]">
                      {/* Badge "Nouveau" */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                        NOUVEAU
                      </div>

                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-red-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-orange-400/50 group-hover:border-orange-300 transition-colors duration-300">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <Users className="w-7 h-7 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                              )}
                            </div>
                            {/* Indicateur de demande */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                              <Clock className="w-2.5 h-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate group-hover:text-orange-100 transition-colors duration-300">
                              {displayName}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                displayType === 'Artiste' 
                                  ? 'bg-purple-500/20 text-purple-300' 
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {displayType}
                              </span>
                            </div>
                            <p className="text-sm text-orange-300 mt-2 font-medium">
                              Souhaite rejoindre votre réseau
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-700/50">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="group/btn flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-600/25"
                            title="Accepter la demande"
                          >
                            <Check className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="font-medium">Accepter</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="group/btn flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25"
                            title="Refuser la demande"
                          >
                            <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
