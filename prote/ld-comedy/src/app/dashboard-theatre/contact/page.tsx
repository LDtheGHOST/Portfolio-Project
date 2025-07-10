"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  User,
  Search,
  ArrowLeft,
  Home,
  Settings,
  Bell,
  Star,
  Sparkles,
  Loader2,
  CheckCircle,
  Circle,
  Zap
} from "lucide-react"

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
    artistProfile?: {
      stageName?: string
      specialties?: string[]
    }
  }
  unreadCount?: number
}

export default function ContactPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends'>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{
    left: string
    top: string
    animationDelay: string
    animationDuration: string
  }>>([])
  
  // Refs pour auto-scroll et animation
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const conversationListRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas des messages
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      })
    }
  }, [])

  // Fonction pour retourner au dashboard
  const goToDashboard = () => {
    window.location.href = '/dashboard-theatre'
  }  // Charger les conversations et amis au démarrage
  useEffect(() => {
    if (session?.user?.id) {
      loadConversations()
      loadFriends()
      
      // Délai pour l'animation d'entrée
      setTimeout(() => setIsInitialLoad(false), 300)
    }
  }, [session])
  // Générer les particules côté client uniquement
  useEffect(() => {
    setIsClient(true)
    const newParticles = Array.from({ length: 6 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`
    }))
    setParticles(newParticles)
  }, [])

  // Filtrer les conversations en temps réel
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conv => {
        const userName = conv.otherUser?.artistProfile?.stageName || conv.otherUser?.name || ''
        const lastMessage = conv.lastMessage || ''
        return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      })
      setFilteredConversations(filtered)
    }
  }, [conversations, searchQuery])

  // Auto-scroll quand de nouveaux messages arrivent
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Charger les conversations avec animation
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
  }// Charger les amis acceptés (artistes connectés au théâtre)
  const loadFriends = async () => {
    try {
      console.log('Chargement des amis...')
      const response = await fetch('/api/favorite')
      console.log('Réponse API favorite:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Données amis reçues:', data)
        // L'API retourne déjà les amis acceptés dans data.friends
        setFriends(data.friends || [])
        console.log('Amis définis:', data.friends?.length || 0)
      } else {
        console.error('Erreur réponse API favorite:', response.status, response.statusText)
        const errorData = await response.text()
        console.error('Détails erreur:', errorData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
    }
  }
  // Charger les messages d'une conversation avec animation
  const loadMessages = async (conversationId: string) => {
    try {
      setMessages([]) // Reset pour animation
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error)
    }
  }

  // Sélectionner une conversation avec transition fluide
  const selectConversation = (conversationId: string) => {
    if (selectedConversation === conversationId) return
    
    setSelectedConversation(conversationId)
    loadMessages(conversationId)
    
    // Marquer comme lue
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ))
  }

  // Envoyer un message avec feedback visuel amélioré
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      senderId: session?.user?.id || '',
      createdAt: new Date().toISOString(),
      isRead: false
    }

    // Ajouter le message temporaire pour feedback immédiat
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    scrollToBottom()

    try {
      setIsSending(true)
      const response = await fetch(`/api/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: tempMessage.content })
      })

      if (response.ok) {
        // Recharger les vrais messages
        loadMessages(selectedConversation)
        loadConversations() // Mettre à jour le dernier message
      } else {
        // Retirer le message temporaire en cas d'erreur
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
        setNewMessage(tempMessage.content) // Restaurer le texte
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      setNewMessage(tempMessage.content)
    } finally {
      setIsSending(false)
    }
  }// Démarrer une conversation avec un artiste ami
  const startConversation = async (friend: any) => {
    try {
      // L'API friend retourne directement l'ID utilisateur dans friend.id
      const artistUserId = friend.id
      
      if (!artistUserId) {
        console.error('Impossible de trouver l\'ID utilisateur de l\'artiste:', friend)
        return
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantId: artistUserId })
      })

      if (response.ok) {
        const data = await response.json()
        setActiveTab('conversations')
        selectConversation(data.conversation?.id || data.id)
        loadConversations()
      }
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error)
    }
  }
  // Formater la date/heure de manière plus lisible
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    if (diff < 604800000) return date.toLocaleDateString('fr-FR', { weekday: 'short' })
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  // Composant de skeleton pour le chargement
  const ConversationSkeleton = () => (
    <div className="p-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-slate-700 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
  // Composant de skeleton pour les messages
  const MessageSkeleton = () => (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="max-w-xs animate-pulse">
            <div 
              className={`h-12 rounded-2xl ${i % 2 === 0 ? 'bg-amber-700' : 'bg-slate-700'}`} 
              style={{ width: `${120 + (i * 40)}px` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )

  // Simulation de typing indicator (à des fins démonstratives)
  useEffect(() => {
    const simulateTyping = () => {
      // Simuler quelqu'un qui tape de temps en temps
      const randomUser = Math.random() > 0.9 ? 'some-user-id' : null
      if (randomUser) {
        setTypingUsers(new Set([randomUser]))
        setTimeout(() => setTypingUsers(new Set()), 3000)
      }
    }

    const interval = setInterval(simulateTyping, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fonction de débounce pour la recherche
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements avec plus d'effets */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>        {/* Particules flottantes - uniquement côté client */}
        {isClient && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration
            }}
          />
        ))}
      </div>

      {/* Header amélioré */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={goToDashboard}
                className="group p-3 bg-gradient-to-r from-purple-600/30 to-amber-600/30 hover:from-purple-600/50 hover:to-amber-600/50 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 border border-purple-500/20"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-purple-300" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative p-3 bg-gradient-to-r from-purple-600 to-amber-600 rounded-2xl">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent">
                    Centre de Messages
                  </h1>
                  <p className="text-purple-200/80 text-sm mt-1 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                    Connectez-vous avec vos artistes partenaires
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="group p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20">
                <Bell className="w-5 h-5 text-purple-300 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={goToDashboard}
                className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600/30 to-amber-600/30 hover:from-purple-600/50 hover:to-amber-600/50 rounded-xl transition-all duration-300 hover:scale-105 border border-purple-500/20"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform text-purple-300" />
                <span className="hidden sm:inline text-purple-200">Dashboard</span>
              </button>
              <button className="group flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20">
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform text-purple-300" />
                <span className="hidden sm:inline text-purple-200">Paramètres</span>
              </button>
            </div>
          </div>          {/* Navigation tabs modernisée */}
          <div className="flex space-x-2 bg-black/30 p-2 rounded-3xl backdrop-blur-sm border border-purple-500/20">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-500 font-medium relative overflow-hidden group ${
                activeTab === 'conversations'
                  ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-xl shadow-purple-500/25 transform scale-[1.02]'
                  : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'conversations' 
                    ? 'bg-white/20' 
                    : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                }`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="font-semibold">Messages</span>
                {Array.isArray(conversations) && conversations.filter(c => (c.unreadCount || 0) > 0).length > 0 && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white animate-bounce shadow-lg">
                    {conversations.reduce((total, c) => total + (c.unreadCount || 0), 0)}
                  </span>
                )}
              </div>
              {activeTab === 'conversations' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-500 font-medium relative overflow-hidden group ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-xl shadow-purple-500/25 transform scale-[1.02]'
                  : 'text-purple-200/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'friends' 
                    ? 'bg-white/20' 
                    : 'bg-purple-500/20 group-hover:bg-purple-500/30'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-semibold">Mes Artistes</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeTab === 'friends' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30'
                }`}>
                  {friends.length}
                </span>
              </div>
              {activeTab === 'friends' && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl"></div>
              )}
            </button>
          </div>
        </div>
      </div>      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {activeTab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-300px)]">
            {/* Liste des conversations */}
            <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-purple-500/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-500/10">
              <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-600/10 to-amber-600/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-amber-600 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Conversations</h2>
                </div>                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input 
                    placeholder="Rechercher une conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-slate-800/50 border-purple-500/30 text-white rounded-2xl h-12 focus:border-purple-400 transition-all duration-300 focus:bg-slate-800/70"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>              <div 
                ref={conversationListRef}
                className="overflow-y-auto max-h-[calc(100vh-500px)] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800 scroll-smooth"
              >
                {isLoading ? (
                  // Skeleton de chargement
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <ConversationSkeleton key={i} />
                    ))}
                  </div>
                ) : !Array.isArray(filteredConversations) || filteredConversations.length === 0 ? (
                  <div className={`p-8 text-center transition-all duration-500 ${isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-purple-600 to-amber-600 rounded-full p-4">
                        {searchQuery ? (
                          <Search className="w-12 h-12 text-white" />
                        ) : (
                          <MessageCircle className="w-12 h-12 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-purple-300 font-medium">
                      {searchQuery ? 'Aucun résultat trouvé' : 'Aucune conversation'}
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      {searchQuery 
                        ? 'Essayez un autre terme de recherche' 
                        : 'Démarrez une conversation avec vos artistes'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation, index) => (
                      <div
                        key={conversation.id}
                        className={`transition-all duration-300 ${
                          isInitialLoad 
                            ? 'opacity-0 translate-x-4' 
                            : 'opacity-100 translate-x-0'
                        }`}
                        style={{ 
                          transitionDelay: isInitialLoad ? `${index * 100}ms` : '0ms' 
                        }}
                      >
                        <button
                          onClick={() => selectConversation(conversation.id)}
                          className={`w-full p-4 text-left hover:bg-purple-600/10 transition-all duration-300 border-b border-slate-700/30 group relative overflow-hidden ${
                            selectedConversation === conversation.id 
                              ? 'bg-gradient-to-r from-purple-600/20 to-amber-600/20 border-purple-400/50 transform scale-[1.02]' 
                              : 'hover:scale-[1.01]'
                          }`}
                        >
                          {/* Effet de survol */}
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="flex items-center space-x-4 relative z-10">
                            <div className="relative">
                              <div className={`w-14 h-14 bg-gradient-to-br from-purple-600 to-amber-600 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all duration-300 ${
                                selectedConversation === conversation.id
                                  ? 'border-purple-400/70 shadow-lg shadow-purple-500/25'
                                  : 'border-transparent group-hover:border-purple-400/50'
                              }`}>
                                {conversation.otherUser?.profileImage ? (
                                  <img 
                                    src={conversation.otherUser.profileImage} 
                                    alt="" 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <User className="w-7 h-7 text-white" />
                                )}
                              </div>
                              
                              {/* Badge de messages non lus */}
                              {(conversation.unreadCount || 0) > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg">
                                  {conversation.unreadCount}
                                </div>
                              )}
                              
                              {/* Indicateur de statut en ligne */}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-white truncate group-hover:text-purple-200 transition-colors duration-300">
                                  {conversation.otherUser?.artistProfile?.stageName || conversation.otherUser?.name || 'Artiste'}
                                </h3>
                                {conversation.lastMessageAt && (
                                  <span className="text-xs text-slate-400 group-hover:text-purple-300 transition-colors duration-300 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTime(conversation.lastMessageAt)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400 truncate group-hover:text-slate-300 transition-colors duration-300 flex-1">
                                  {typingUsers.has(conversation.otherUser?.id || '') ? (
                                    <span className="text-purple-400 italic flex items-center">
                                      <Zap className="w-3 h-3 mr-1 animate-pulse" />
                                      En train d'écrire...
                                    </span>
                                  ) : (
                                    conversation.lastMessage || 'Pas de messages'
                                  )}
                                </p>
                                
                                {/* Indicateurs visuels */}
                                <div className="flex items-center space-x-1 ml-2">
                                  {selectedConversation === conversation.id && (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  )}
                                  {(conversation.unreadCount || 0) > 0 && (
                                    <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone de chat modernisée */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-purple-500/20 backdrop-blur-xl flex flex-col shadow-2xl shadow-purple-500/10">
              {selectedConversation ? (
                <>
                  {/* Header du chat */}
                  <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-500 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                      <div>                        <h3 className="font-medium text-white">
                          {Array.isArray(conversations) && conversations.find(c => c.id === selectedConversation)?.otherUser?.artistProfile?.stageName || 
                           Array.isArray(conversations) && conversations.find(c => c.id === selectedConversation)?.otherUser?.name || 'Artiste'}
                        </h3>
                        <p className="text-xs text-gray-400">En ligne</p>
                      </div>
                    </div>
                  </div>                  {/* Messages avec auto-scroll et animations */}
                  <div 
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent"
                  >
                    {!messages.length ? (
                      <MessageSkeleton />
                    ) : (
                      <>
                        {messages.map((message, index) => {
                          const isOwn = message.senderId === session?.user?.id
                          const isTemp = message.id.startsWith('temp-')
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                                isTemp ? 'opacity-70' : 'opacity-100'
                              } animate-in slide-in-from-bottom-2 duration-300`}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="max-w-xs lg:max-w-md group">
                                <div
                                  className={`px-4 py-3 rounded-2xl relative transition-all duration-300 hover:scale-[1.02] ${
                                    isOwn
                                      ? `${isTemp ? 'bg-amber-600/70' : 'bg-gradient-to-r from-amber-600 to-amber-500'} text-white shadow-lg shadow-amber-500/25`
                                      : 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/25'
                                  }`}
                                >                                  {/* Effet de brillance au survol */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 rounded-2xl transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                                  
                                  <p className="relative z-10 leading-relaxed">{message.content}</p>
                                  
                                  <div className="flex items-center justify-between mt-2 relative z-10">
                                    <p className="text-xs opacity-70">
                                      {formatTime(message.createdAt)}
                                    </p>
                                    
                                    {isOwn && (
                                      <div className="flex items-center space-x-1">
                                        {isTemp ? (
                                          <Loader2 className="w-3 h-3 animate-spin opacity-70" />
                                        ) : message.isRead ? (
                                          <CheckCircle className="w-3 h-3 text-green-300" />
                                        ) : (
                                          <CheckCircle className="w-3 h-3 opacity-50" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        
                        {/* Indicateur de frappe */}
                        {typingUsers.has(Array.isArray(conversations) ? conversations.find(c => c.id === selectedConversation)?.otherUser?.id || '' : '') && (
                          <div className="flex justify-start animate-in slide-in-from-bottom-2">
                            <div className="bg-slate-700 px-4 py-2 rounded-2xl">
                              <div className="flex items-center space-x-1">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                                <span className="text-xs text-slate-400 ml-2">En train d'écrire...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Ancre pour auto-scroll */}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>                  {/* Zone de saisie améliorée */}
                  <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1 relative">
                        <div className="relative">                          <textarea
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value)
                              // Auto-resize
                              e.target.style.height = 'auto'
                              e.target.style.height = `${Math.min(128, Math.max(48, e.target.scrollHeight))}px`
                            }}
                            placeholder="Tapez votre message..."
                            className="w-full bg-black/50 border border-gray-600 text-white rounded-2xl px-4 py-3 pr-12 resize-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 focus:bg-black/70"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                              }
                            }}
                          />
                          
                          {/* Indicateur de caractères */}
                          <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                            {newMessage.length > 0 && (
                              <span className={`transition-colors duration-200 ${
                                newMessage.length > 500 ? 'text-red-400' : 'text-slate-400'
                              }`}>
                                {newMessage.length}/1000
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Suggestions rapides */}
                        {newMessage.length === 0 && (
                          <div className="absolute top-full left-0 mt-2 flex flex-wrap gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                            {['👋 Salut !', '✅ D\'accord', '❓ Une question ?', '📅 Planifions'].map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => setNewMessage(suggestion)}
                                className="px-3 py-1 text-xs bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors duration-200"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Bouton d'emoji (placeholder) */}
                        <button className="p-3 text-slate-400 hover:text-purple-400 transition-colors duration-200 hover:bg-purple-600/10 rounded-xl">
                          <span className="text-lg">😊</span>
                        </button>
                        
                        {/* Bouton d'envoi amélioré */}
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className={`p-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                            newMessage.trim() && !isSending
                              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105'
                              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {/* Effet de brillance */}
                          {newMessage.trim() && !isSending && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                          )}
                          
                          <div className="relative z-10 flex items-center justify-center">
                            {isSending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className={`w-5 h-5 transition-transform duration-200 ${
                                newMessage.trim() ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''
                              }`} />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* Conseils d'utilisation */}
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>Entrée pour envoyer, Shift+Entrée pour nouvelle ligne</span>
                      {isSending && (
                        <span className="text-amber-400 animate-pulse">Envoi en cours...</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-400">
                      Choisissez une conversation pour commencer à échanger
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}        {activeTab === 'friends' && (
          <div className={`space-y-6 transition-all duration-500 ${isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-amber-200 bg-clip-text text-transparent">
                  Mes Artistes Partenaires
                </h2>
                <div className="flex items-center space-x-4">
                  <p className="text-purple-200/80 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {friends.length > 0 
                      ? `${friends.length} artiste${friends.length > 1 ? 's' : ''} dans votre réseau`
                      : "Aucun artiste dans votre réseau"
                    }
                  </p>
                  {friends.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Réseau actif</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bouton de rafraîchissement */}
              <button
                onClick={loadFriends}
                className="group p-3 bg-gradient-to-r from-purple-600/30 to-amber-600/30 hover:from-purple-600/50 hover:to-amber-600/50 rounded-2xl transition-all duration-300 hover:scale-105 border border-purple-500/20"
              >
                <div className={`transition-transform duration-300 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                  <Sparkles className="w-5 h-5 text-purple-300" />
                </div>
              </button>
            </div>
            
            {friends.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl border border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
                {/* Effet de fond animé */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-purple-600 to-amber-600 rounded-full p-6">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Aucun artiste partenaire</h3>
                  <p className="text-purple-200/80 mb-8 max-w-md mx-auto leading-relaxed">
                    Connectez-vous avec des artistes pour pouvoir échanger et collaborer ensemble. 
                    Développez votre réseau créatif !
                  </p>
                  
                  <button className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/25">
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Découvrir des artistes</span>
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {friends.map((friend, index) => {
                  const displayName = friend.stageName || friend.name || 'Artiste'
                  const displayImage = friend.profileImage || ''
                  const displaySpecialties = friend.specialties || []

                  return (
                    <div 
                      key={friend.id} 
                      className={`group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl border border-purple-500/20 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${
                        isInitialLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                      }`}
                      style={{ 
                        transitionDelay: isInitialLoad ? `${index * 150}ms` : '0ms' 
                      }}
                    >
                      {/* Effet de brillance au survol */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                      
                      <div className="relative z-10 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-amber-600 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-purple-500/30 group-hover:border-amber-400/50 transition-all duration-300 group-hover:scale-110">
                                {displayImage ? (
                                  <img 
                                    src={displayImage} 
                                    alt="" 
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <User className="w-8 h-8 text-white" />
                                )}
                              </div>
                              
                              {/* Badge de statut */}
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 group-hover:scale-110 transition-transform duration-300"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-amber-300 group-hover:bg-clip-text transition-all duration-300 truncate">
                                {displayName}
                              </h3>
                              <p className="text-sm text-purple-200/80 mt-1 truncate">
                                {friend.email}
                              </p>
                            </div>
                          </div>
                          
                          {/* Étoile de favoris */}
                          <button className="p-2 hover:bg-amber-500/20 rounded-xl transition-colors duration-200 group/star">
                            <Star className="w-5 h-5 text-amber-400 group-hover/star:fill-amber-400 transition-all duration-200" />
                          </button>
                        </div>
                        
                        {/* Spécialités */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(displaySpecialties) && displaySpecialties.slice(0, 3).map((specialty, idx) => (
                              <span 
                                key={idx}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-400/20 to-purple-400/20 text-amber-300 text-xs rounded-lg border border-amber-400/30 group-hover:border-amber-400/50 transition-all duration-300 hover:scale-105"
                              >
                                {specialty}
                              </span>
                            ))}                            {displaySpecialties.length > 3 && (
                              <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-400/30">
                                +{displaySpecialties.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-3">
                          <button
                            onClick={() => startConversation(friend)}
                            className="flex-1 group/btn bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                          >
                            <span className="flex items-center justify-center space-x-2">
                              <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                              <span>Message</span>
                            </span>
                          </button>
                          
                          <button className="group/btn p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl transition-all duration-300 hover:scale-105 border border-purple-500/30">
                            <User className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
