'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Reservation {
  id: string
  showId: string
  seats: number
  status: string
  totalPrice: number
  createdAt: string
  show: {
    title: string
    date: string
    venue: string
  }
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const [activeTab, setActiveTab] = useState(tabParam || 'profile')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (status === 'unauthenticated') {
      router.push('/connexion')
    }

    // Si l'utilisateur est connecté, charger ses réservations
    if (status === 'authenticated') {
      fetchReservations()
    }
  }, [status, router])

  useEffect(() => {
    // Mettre à jour l'onglet actif quand le paramètre d'URL change
    if (tabParam && ['profile', 'reservations', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  async function fetchReservations() {
    try {
      setLoading(true)
      const response = await fetch('/api/reservations/user')
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des réservations')
      }
      
      const data = await response.json()
      setReservations(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour l'URL quand l'onglet change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-red-950 py-24 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-amber-400 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950 py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-amber-400/20"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Mon espace</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-black/40 rounded-xl p-6 border border-amber-400/10">
                <div className="flex flex-col space-y-2 mb-6">
                  <div className="h-24 w-24 rounded-full bg-amber-400/20 mx-auto flex items-center justify-center">
                    <span className="text-3xl text-amber-400">
                      {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <p className="text-white text-center font-medium mt-4">{session?.user?.name || 'Utilisateur'}</p>
                  <p className="text-gray-400 text-center text-sm">{session?.user?.email}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    Mon profil
                  </button>
                  <button
                    onClick={() => handleTabChange('reservations')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'reservations'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    Mes réservations
                  </button>
                  <button
                    onClick={() => handleTabChange('settings')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-amber-400/20 text-amber-400'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    Paramètres
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="md:w-3/4">
              <div className="bg-black/40 rounded-xl p-6 border border-amber-400/10 h-full">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Mon profil</h2>
                    <div className="bg-black/30 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Nom</p>
                          <p className="text-white">{session?.user?.name || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Email</p>
                          <p className="text-white">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-amber-400 text-black font-medium px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors">
                        Modifier mon profil
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'reservations' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Mes réservations</h2>
                    
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-t-2 border-amber-400 rounded-full"></div>
                      </div>
                    ) : reservations.length > 0 ? (
                      <div className="space-y-4">
                        {reservations.map((reservation) => (
                          <div 
                            key={reservation.id}
                            className="bg-black/30 rounded-lg p-4 border border-amber-400/10 hover:border-amber-400/30 transition-colors"
                          >
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-white">{reservation.show.title}</h3>
                                <p className="text-gray-400 text-sm">
                                  {new Date(reservation.show.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-gray-400 text-sm">{reservation.show.venue}</p>
                              </div>
                              <div className="mt-3 md:mt-0 flex flex-col items-end">
                                <span className={`text-sm px-2 py-1 rounded-full ${
                                  reservation.status === 'confirmed' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : reservation.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {reservation.status === 'confirmed' ? 'Confirmé' : 
                                   reservation.status === 'cancelled' ? 'Annulé' : 'En attente'}
                                </span>
                                <p className="text-white mt-2">{reservation.seats} {reservation.seats > 1 ? 'places' : 'place'}</p>
                                <p className="text-amber-400 font-medium">{reservation.totalPrice} €</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/30 rounded-lg p-8 text-center border border-amber-400/10">
                        <p className="text-gray-300 mb-4">Vous n&apos;avez pas encore de réservation.</p>
                        <Link 
                          href="/spectacles" 
                          className="inline-block bg-amber-400 text-black font-medium px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors"
                        >
                          Voir les spectacles
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
                    <div className="bg-black/30 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">Changer de mot de passe</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-amber-400 mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-amber-400 mb-2">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-400 mb-2">
                            Confirmer le nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-4 py-3 rounded-lg bg-black/50 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <button className="bg-amber-400 text-black font-medium px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors">
                          Mettre à jour le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-black to-red-950 py-24 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-amber-400 rounded-full"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
} 