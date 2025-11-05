"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Users, Check, X, Clock, UserPlus } from "lucide-react"

interface FriendRequest {
  id: string
  status: string
  createdAt: string
  theater: {
    id: string
    name: string
    profileImage?: string
    location?: string
  }
}

interface Friend {
  id: string
  theater: {
    id: string
    name: string
    profileImage?: string
    location?: string
  }
}

export default function ArtistFriendsPage() {
  const { data: session } = useSession()
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFriendRequests()
    loadFriends()
  }, [])

  const loadFriendRequests = async () => {
    try {
      const res = await fetch('/api/favorite/requests')
      if (res.ok) {
        const data = await res.json()
        setFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error)
    }
  }

  const loadFriends = async () => {
    try {
      const res = await fetch('/api/favorite/friends')
      if (res.ok) {
        const data = await res.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
    }
    setLoading(false)
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/favorite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      
      if (res.ok) {
        loadFriendRequests()
        loadFriends()
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const res = await fetch('/api/favorite/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      
      if (res.ok) {
        loadFriendRequests()
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error)
    }
  }

  const handleRemoveFriend = async (friendId: string, theaterId: string) => {
    try {
      const res = await fetch('/api/favorite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theaterId })
      })
      
      if (res.ok) {
        loadFriends()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-amber-400 py-12">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-amber-400">Mes Amis Théâtres</h1>
        </div>

        {/* Demandes en attente */}
        {friendRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Demandes en attente ({friendRequests.length})
            </h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request.id} className="bg-white/10 rounded-xl p-4 border border-amber-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center overflow-hidden">
                        {request.theater.profileImage ? (
                          <img src={request.theater.profileImage} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{request.theater.name}</h3>
                        <p className="text-gray-400 text-sm">{request.theater.location || 'Localisation non renseignée'}</p>
                        <p className="text-amber-300 text-xs">Demande reçue le {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des amis */}
        <div>
          <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Mes Théâtres Amis ({friends.length})
          </h2>
          
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aucun théâtre ami pour le moment</p>
              <p className="text-sm mt-2">Explorez les théâtres et envoyez des demandes d'amitié !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-white/10 rounded-xl p-4 border border-amber-400/20 hover:border-amber-400/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center overflow-hidden">
                        {friend.theater.profileImage ? (
                          <img src={friend.theater.profileImage} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{friend.theater.name}</h3>
                        <p className="text-gray-400 text-sm">{friend.theater.location || 'Localisation non renseignée'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id, friend.theater.id)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Retirer de mes amis"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
