'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Instagram, Twitter, Youtube, Calendar, User, Mic, ArrowLeft, MapPin, Clock } from 'lucide-react'

interface Show {
  id: string
  title: string
  venue: string
  date: string
  time: string
  price?: string
  status: string
}

interface ComedianProfile {
  id: string
  name: string | null
  profileImage: string | null
  description: string | null
  specialty: string | null
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
  } | null
  shows: Show[]
  totalShows: number
}

export default function ComedianProfile({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [comedian, setComedian] = useState<ComedianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComedianData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/comedians/${params.id}`)
        if (!response.ok) {
          throw new Error('Artiste non trouvé')
        }
        const data = await response.json()
        setComedian(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchComedianData()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400 text-xl flex items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full" />
          Chargement...
        </div>
      </div>
    )
  }

  if (error || !comedian) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/comediens"
            className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux artistes
          </Link>
          <div className="text-red-400 text-center">
            {error || "Artiste non trouvé"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Header avec image de fond */}
      <div className="relative h-[50vh] min-h-[400px]">
        {comedian.profileImage ? (
          <Image
            src={comedian.profileImage}
            alt={comedian.name || 'Artiste'}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-red-950 to-black">
            <div className="h-full flex items-center justify-center">
              <User className="w-32 h-32 text-amber-400/30" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Bouton retour */}
        <div className="absolute top-8 left-8 z-10">
          <Link 
            href="/comediens"
            className="inline-flex items-center text-white hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour aux artistes
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche - Informations de l'artiste */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-amber-400/20"
            >
              <h1 className="text-4xl font-bold text-white mb-2">
                {comedian.name || 'Artiste'}
              </h1>
              <div className="flex items-center gap-2 mb-6">
                <Mic className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-medium">
                  {comedian.specialty || "Humoriste"}
                </span>
              </div>
              
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300">
                  {comedian.description || "Description non disponible"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <Mic className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {comedian.totalShows}
                  </div>
                  <div className="text-sm text-gray-400">
                    {comedian.totalShows > 1 ? 'Spectacles' : 'Spectacle'}
                  </div>
                </div>
              </div>

              {comedian.socialLinks && Object.keys(comedian.socialLinks).length > 0 && (
                <div className="flex gap-4">
                  {comedian.socialLinks.instagram && (
                    <a
                      href={comedian.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {comedian.socialLinks.twitter && (
                    <a
                      href={comedian.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {comedian.socialLinks.youtube && (
                    <a
                      href={comedian.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      <Youtube className="w-6 h-6" />
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Colonne de droite - Prochains spectacles */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-400/20"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Prochains spectacles
              </h2>
              
              {comedian.shows && comedian.shows.length > 0 ? (
                <div className="space-y-4">
                  {comedian.shows.map((show) => (
                    <div
                      key={show.id}
                      className="bg-black/30 rounded-lg p-4 hover:bg-black/40 transition-colors group"
                    >
                      <h3 className="font-medium text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {show.title}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <span>{show.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>{show.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>{show.time}</span>
                        </div>
                        {show.price && (
                          <div className="text-amber-400 font-medium">
                            {show.price} €
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="secondary"
                          className="w-full bg-amber-400 text-black hover:bg-amber-300 transition-all duration-300"
                        >
                          Réserver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun spectacle programmé
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}