"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Check, X, Users, Clock } from "lucide-react";

interface FriendRequest {
  id: string;
  status: string;
  createdAt: string;
  artist?: {
    id: string;
    user: {
      id: string;
      name: string;
      profileImage?: string;
      email: string;
    };
  };
  theater?: {
    id: string;
    theaterName?: string;
    user: {
      id: string;
      name: string;
      profileImage?: string;
      email: string;
    };
  };
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'theater' | 'artist'>('artist');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/favorite/requests');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
        setFriends(data.friends || []);
        setUserType(data.userType || 'artist');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    }
    setLoading(false);
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject', artistId?: string, theaterId?: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch('/api/favorite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          artistId,
          theaterId
        })
      });

      if (res.ok) {
        await fetchFriends(); // Recharger les données
      } else {
        const error = await res.json();
        alert('Erreur: ' + (error.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la réponse à la demande:', error);
      alert('Erreur lors de la réponse à la demande');
    }
    setActionLoading(null);
  };

  const removeFriend = async (artistId?: string, theaterId?: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet ami ?')) return;

    try {
      const res = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId,
          theaterId
        })
      });

      if (res.ok) {
        await fetchFriends(); // Recharger les données
      } else {
        const error = await res.json();
        alert('Erreur: ' + (error.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ami:', error);
      alert('Erreur lors de la suppression de l\'ami');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-amber-400 py-12">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-8 flex items-center gap-3">
          <Users className="w-8 h-8" />
          Gestion des Amis
        </h1>

        {/* Demandes en attente */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Demandes en attente ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <div className="bg-white/10 rounded-xl p-6 text-center text-gray-400">
              Aucune demande en attente
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const profile = userType === 'theater' ? request.artist : request.theater;
                const displayName = userType === 'theater' 
                  ? profile?.user.name 
                  : (request.theater?.theaterName || profile?.user.name);
                
                return (
                  <div key={request.id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden flex items-center justify-center bg-gray-800">
                        {profile?.user.profileImage ? (
                          <img 
                            src={profile.user.profileImage} 
                            alt={displayName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{displayName}</h3>
                        <p className="text-sm text-gray-400">{profile?.user.email}</p>
                        <p className="text-xs text-amber-300">
                          {userType === 'theater' ? '🎭 Artiste' : '🏛️ Théâtre'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequest(
                          request.id, 
                          'accept',
                          userType === 'theater' ? request.artist?.id : undefined,
                          userType === 'artist' ? request.theater?.id : undefined
                        )}
                        disabled={actionLoading === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleRequest(
                          request.id, 
                          'reject',
                          userType === 'theater' ? request.artist?.id : undefined,
                          userType === 'artist' ? request.theater?.id : undefined
                        )}
                        disabled={actionLoading === request.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Amis actuels */}
        <div>
          <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mes Amis ({friends.length})
          </h2>
          
          {friends.length === 0 ? (
            <div className="bg-white/10 rounded-xl p-6 text-center text-gray-400">
              Aucun ami pour le moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => {
                const profile = userType === 'theater' ? friend.artist : friend.theater;
                const displayName = userType === 'theater' 
                  ? profile?.user.name 
                  : (friend.theater?.theaterName || profile?.user.name);
                
                return (
                  <div key={friend.id} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden flex items-center justify-center bg-gray-800">
                        {profile?.user.profileImage ? (
                          <img 
                            src={profile.user.profileImage} 
                            alt={displayName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{displayName}</h3>
                        <p className="text-sm text-gray-400">{profile?.user.email}</p>
                        <p className="text-xs text-amber-300">
                          {userType === 'theater' ? '🎭 Artiste' : '🏛️ Théâtre'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(
                        userType === 'theater' ? friend.artist?.id : undefined,
                        userType === 'artist' ? friend.theater?.id : undefined
                      )}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
