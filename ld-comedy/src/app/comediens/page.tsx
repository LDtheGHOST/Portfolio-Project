'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Instagram, Twitter, Youtube, Calendar, User, Mic } from 'lucide-react'

interface Artist {
  id: string
  name: string | null
  image: string | null
  specialty: string | null
  description: string | null
  socialLinks?: {
    instagram?: string
    twitter?: string
    youtube?: string
  } | null
}

export default function Artistes() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/comedians')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Une erreur est survenue')
        }
        
        const data = await response.json()
        setArtists(data)
      } catch (error) {
        console.error('Erreur détaillée:', error)
        setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black flex items-center justify-center"
      >
        <div className="text-amber-400 text-xl flex items-center gap-2">
          <div className="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full" />
          Chargement des artistes...
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-400 mb-4">
            Erreur: {error}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-amber-400 text-black hover:bg-amber-500"
          >
            Réessayer
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-black to-red-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] z-0"
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Nos <span className="text-amber-400">Artistes</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Découvrez les talents qui font la renommée de notre comedy club
            </p>
          </motion.div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-20 bg-red-950">
        <div className="container mx-auto px-4">
          {artists.length > 0 ? (
            <div className="grid gap-12 md:grid-cols-2">
              {artists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative flex flex-col bg-gradient-to-br from-black/80 to-red-950/80 rounded-2xl overflow-hidden shadow-2xl border border-amber-400/10 hover:border-amber-400/30 transition-all duration-300"
                >
                  <div className="relative w-full h-80">
                    {artist.image ? (
                      <Image
                        src={artist.image}
                        alt={artist.name || "Artiste"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-red-950 flex items-center justify-center">
                        <User className="w-24 h-24 text-amber-400/30" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </div>

                  <div className="relative p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {artist.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <Mic className="w-4 h-4 text-amber-400" />
                        <p className="text-amber-400 font-medium">
                          {artist.specialty || "Humoriste"}
                        </p>
                      </div>
                      <p className="text-gray-300 mb-6 line-clamp-3">
                        {artist.description || "Plus d'informations à venir..."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Social Links */}
                      {artist.socialLinks && (
                        <div className="flex gap-4">
                          {artist.socialLinks.instagram && (
                            <a
                              href={artist.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-amber-400 transition-colors"
                            >
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                          {artist.socialLinks.twitter && (
                            <a
                              href={artist.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-amber-400 transition-colors"
                            >
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                          {artist.socialLinks.youtube && (
                            <a
                              href={artist.socialLinks.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-amber-400 transition-colors"
                            >
                              <Youtube className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <Link 
                          href={`/spectacles?artist=${artist.id}`} 
                          className="flex-1"
                        >
                          <Button 
                            variant="secondary" 
                            className="w-full bg-amber-400 text-red-950 hover:bg-amber-300 transition-all duration-300 shadow-lg hover:shadow-amber-400/20"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Voir les dates
                          </Button>
                        </Link>
                        <Link 
                          href={`/comediens/${artist.id}`}
                          className="flex-1"
                        >
                          <Button 
                            variant="outline" 
                            className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950 transition-all duration-300"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Plus d&#39;infos
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/30 rounded-xl p-8 max-w-2xl mx-auto border border-amber-400/10"
              >
                <User className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">
                  Aucun artiste disponible pour le moment.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Join Us Section */}
       <section className="py-20 bg-gradient-to-b from-red-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Rejoignez notre <span className="text-amber-400">Scène</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Vous êtes humoriste et souhaitez vous produire sur notre scène ? 
              Contactez-nous pour participer à nos soirées découvertes.
            </p>
            <Link href="/contact">
              <Button 
                size="lg"
                className="bg-amber-400 text-red-950 hover:bg-amber-300 transition-all duration-300"
              >
                Nous contacter
              </Button>
            </Link>
          </motion.div>
           </div>
      </section>
    </main>
  )
}