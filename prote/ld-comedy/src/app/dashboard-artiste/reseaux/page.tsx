"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Mail, 
  MessageCircle, 
  Send, 
  Users, 
  Clock,
  User,  Search,
  ArrowLeft,
  Home,
  Settings,
  Bell,
  Star,
  Sparkles,
  MoreVertical,
  Smile,
  Paperclip,
  Image,
  Check,
  CheckCheck,
  Heart,
  Music,
  Palette
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageAt?: string
  messages?: Message[]
  otherUser?: {
    id: string
    name: string
    profileImage?: string
    role: string
    theaterProfile?: {
      theaterName?: string
    }
  }
  unreadCount?: number
}

export default function ReseauxPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends'>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Charger les conversations et amis au démarrage
  useEffect(() => {
    if (session?.user?.email) {
      loadConversations()
      loadFriends()
    }
  }, [session])

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les amis acceptés (théâtres connectés à l'artiste)
  const loadFriends = async () => {
    try {
      const response = await fetch('/api/favorite')
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
    }
  }

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  // Sélectionner une conversation
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id)
    loadMessages(conversation.id)
  }

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage('')
        loadMessages(selectedConversation)
        loadConversations() // Refresh conversations list
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // Démarrer une conversation avec un ami
  const startConversationWithFriend = async (friend: any) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: friend.theater?.userId || friend.userId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveTab('conversations')
        setSelectedConversation(data.conversation.id)
        loadConversations()
        loadMessages(data.conversation.id)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400">Connexion requise...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}      <header className="bg-gray-900 border-b border-amber-400/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard-artiste" className="text-amber-400 hover:text-amber-300 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-amber-400">Centre de Messages</h1>
              <p className="text-sm text-gray-400">Restez connecté avec vos théâtres partenaires</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-amber-400" />
              {conversations.filter(c => c.unreadCount && c.unreadCount > 0).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                </span>
              )}
            </div>
            <User className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-900 via-purple-900/10 to-pink-900/10 border-r border-purple-800/30">
          {/* Tabs */}
          <div className="p-4 border-b border-purple-800/30">
            <div className="flex bg-gray-800/50 backdrop-blur rounded-xl p-1 border border-purple-700/20">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'conversations'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-purple-200 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                <span className="font-bold">Messages</span>
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'friends'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-purple-200 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Connexions
              </button>
            </div>
          </div>{/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div className="flex-1 overflow-y-auto">              {/* Search Bar */}
              <div className="p-4 border-b border-purple-800/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une conversation..."
                    className="pl-10 bg-gray-800/50 backdrop-blur border-purple-600/30 text-white placeholder-purple-300/70 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                  Chargement des conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="font-medium">Aucune conversation</p>
                  <p className="text-sm">Connectez-vous avec des théâtres pour commencer</p>
                </div>
              ) : (                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        selectedConversation === conversation.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 shadow-lg shadow-purple-500/10'
                          : 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:shadow-md border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-full flex items-center justify-center border-2 border-purple-300/30 shadow-lg">
                            <User className="w-7 h-7 text-purple-200" />
                          </div>
                          {/* Status indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full border-3 border-gray-900 shadow-lg animate-pulse"></div>
                        </div>                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold truncate text-white text-lg">
                              {conversation.otherUser?.theaterProfile?.theaterName || 
                               conversation.otherUser?.name || 
                               'Théâtre'}
                            </div>
                            <div className="text-xs text-purple-300 font-medium">
                              {conversation.lastMessageAt ? 
                                new Date(conversation.lastMessageAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 
                                ''}
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 truncate mb-1">
                            {conversation.lastMessage || 'Démarrer une conversation créative...'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-pink-300" />
                            <span className="text-xs text-pink-300">Collaboration artistique</span>
                          </div>
                        </div>                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-bounce">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="flex-1 overflow-y-auto">
              {friends.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="font-medium">Aucune connexion</p>
                  <p className="text-sm">Connectez-vous avec des théâtres</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 rounded-lg hover:bg-gray-800 cursor-pointer"
                      onClick={() => startConversationWithFriend(friend)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {friend.theater?.theaterProfile?.theaterName || 
                             friend.theater?.user?.name || 
                             'Théâtre'}
                          </div>
                          <div className="text-sm text-gray-400">
                            Théâtre partenaire
                          </div>
                        </div>
                        <MessageCircle className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>              {/* Chat Header */}
              <div className="p-4 border-b border-purple-800/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center border-2 border-purple-400/40 shadow-lg">
                        <User className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">
                        {conversations.find(c => c.id === selectedConversation)?.otherUser?.theaterProfile?.theaterName ||
                         conversations.find(c => c.id === selectedConversation)?.otherUser?.name ||
                         'Théâtre'}
                      </div>
                      <div className="text-sm text-green-300 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <Music className="w-3 h-3" />
                        Partenaire créatif en ligne
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-purple-300 hover:bg-purple-500/20 border-purple-400/30 p-2 hover:border-purple-300 transition-all">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="text-pink-300 hover:bg-pink-500/20 border-pink-400/30 p-2 hover:border-pink-300 transition-all">
                      <Palette className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="text-purple-300 hover:bg-purple-500/20 border-purple-400/30 p-2 hover:border-purple-300 transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>Aucun message dans cette conversation</p>
                    <p className="text-sm">Commencez la conversation!</p>
                  </div>                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === session.user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
                            message.senderId === session.user?.id
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md shadow-purple-500/20'
                              : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-bl-md border border-purple-500/20 shadow-gray-700/20'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>                          <div className={`flex items-center justify-between mt-2 ${
                            message.senderId === session.user?.id ? 'text-white/80' : 'text-gray-300'
                          }`}>
                            <p className="text-xs">
                              {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>                            {message.senderId === session.user?.id && (
                              <div className="ml-2">
                                {message.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-white/60" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>              {/* Message Input */}
              <div className="p-4 border-t border-purple-800/30 bg-gradient-to-r from-gray-900/50 to-purple-900/20">
                <div className="flex items-end gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="p-2 border-purple-600/30 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all">
                      <Paperclip className="w-4 h-4 text-purple-300" />
                    </Button>
                    <Button variant="outline" className="p-2 border-purple-600/30 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all">
                      <Image className="w-4 h-4 text-purple-300" />
                    </Button>
                    <Button variant="outline" className="p-2 border-purple-600/30 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all">
                      <Smile className="w-4 h-4 text-purple-300" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Créons ensemble quelque chose de magique... ✨"
                      className="bg-gray-800/50 backdrop-blur border-purple-600/30 text-white placeholder-purple-300/70 focus:border-purple-400 focus:ring-purple-400/20 resize-none rounded-xl"
                      disabled={isSending}
                    />
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-purple-500/20 rounded-xl"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-purple-300/70 mt-3 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Espace créatif sécurisé • Messages chiffrés</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
            </>          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-950/50 via-purple-950/20 to-pink-950/20">
              <div className="text-center text-gray-400 max-w-md">
                <div className="mb-8">
                  <div className="relative">
                    <MessageCircle className="w-28 h-28 mx-auto mb-4 text-purple-500/40" />
                    <div className="absolute inset-0 w-28 h-28 mx-auto">
                      <Sparkles className="w-6 h-6 text-pink-400 absolute top-2 right-8 animate-pulse" />
                      <Star className="w-4 h-4 text-purple-300 absolute bottom-6 left-6 animate-bounce" />
                      <Heart className="w-5 h-5 text-pink-300 absolute top-8 left-4 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Votre Espace Créatif
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                  Sélectionnez une conversation pour commencer à collaborer avec vos théâtres partenaires.
                  <br />
                  <span className="text-purple-300">Créez, planifiez et donnez vie à vos projets artistiques.</span>
                </p>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex items-center justify-center gap-3 text-purple-300">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                    <Sparkles className="w-4 h-4" />
                    <span>Messages instantanés et créatifs</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-pink-300">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    <Heart className="w-4 h-4" />
                    <span>Collaborations artistiques en temps réel</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-purple-300">
                    <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
                    <Music className="w-4 h-4" />
                    <span>Réseau professionnel du spectacle</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

