'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Calendar, MapPin, Star, Users, TrendingUp } from 'lucide-react'

interface Poster {
  id: string
  imageUrl: string
  description: string
  createdAt: string
  likesCount: number
  commentsCount: number
  author: {
    id: string
    name: string
    image?: string
    type: 'artist' | 'theater'
    artistName?: string
    theaterName?: string
    city?: string
  }
}

interface Theater {
  id: string
  name: string
  city: string
  description: string
  image: string
  postersCount: number
  user: {
    id: string
    name: string
    email: string
    joinedAt: string
  }
}

interface Artist {
  id: string
  name: string
  type: string
  city: string
  bio: string
  image: string
  postersCount: number
  user: {
    id: string
    name: string
    email: string
    joinedAt: string
  }
}

export default function Home() {
  const router = useRouter()
  const [popularPosters, setPopularPosters] = useState<Poster[]>([])
  const [featuredTheaters, setFeaturedTheaters] = useState<Theater[]>([])
  const [successfulArtists, setSuccessfulArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Charger les affiches populaires
        const postersResponse = await fetch('/api/home/popular-posters')
        if (postersResponse.ok) {
          const postersData = await postersResponse.json()
          setPopularPosters(postersData || [])
        }

        // Charger les théâtres à la une
        const theatersResponse = await fetch('/api/home/featured-theaters')
        if (theatersResponse.ok) {
          const theatersData = await theatersResponse.json()
          setFeaturedTheaters(theatersData || [])
        }

        // Charger les artistes à succès
        const artistsResponse = await fetch('/api/home/successful-artists')
        if (artistsResponse.ok) {
          const artistsData = await artistsResponse.json()
          setSuccessfulArtists(artistsData || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/rideau.mp4" type="video/mp4" />
        </video>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] z-20" 
        />
        <div className="container mx-auto flex h-full items-center justify-center px-4">
          <div className="relative z-30 max-w-3xl text-white text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold leading-tight sm:text-6xl"
            >
              Le meilleur du stand-up à Paris
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-amber-200"
            >
              Découvrez les talents émergents et confirmés du stand-up français dans une ambiance unique et chaleureuse.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex justify-center gap-4"
            >
              <Button 
                size="lg" 
                className="bg-amber-400 hover:bg-amber-500 text-red-950"
                onClick={() => router.push('/comediens')}
              >
                Voir les Artistes
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950"
                onClick={() => router.push('/spectacles')}
              >
                Voir le programme
              </Button>
            </motion.div>
          </div>
        </div>
      </section>      {/* Featured Posters Section */}
      <section className="relative py-32 bg-red-950 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 md:mb-0">
              Affiches<br />
              <span className="text-amber-400">Populaires</span>
            </h2>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950"
              onClick={() => router.push('/spectacles')}
            >
              Voir tous les spectacles
            </Button>
          </div>
          
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {popularPosters.slice(0, 3).map((poster, i) => (
                <motion.div
                  key={poster.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-xl bg-purple-800 cursor-pointer"
                  onClick={() => router.push(`/affiches/${poster.id}`)}
                >
                  <div className="relative h-96 overflow-hidden">                    {poster.imageUrl ? (
                      <Image
                        src={poster.imageUrl}
                        alt={`Affiche de ${poster.author.artistName || poster.author.theaterName || poster.author.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-6xl">🎭</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-red-950 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(poster.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {poster.author.city && (
                        <span className="text-amber-400 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {poster.author.city}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {poster.author.artistName || poster.author.theaterName || poster.author.name}
                    </h3>
                    <p className="text-red-200 mb-4 line-clamp-2">
                      {poster.description || "Nouvelle affiche disponible"}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-pink-300">
                          <Heart className="w-4 h-4" />
                          {poster.likesCount}
                        </span>
                        <span className="text-amber-300">
                          {poster.commentsCount} commentaires
                        </span>
                      </div>
                      <span className="text-sm text-purple-300">
                        {poster.author.type === 'artist' ? 'Artiste' : 'Théâtre'}
                      </span>
                    </div>                    <Button 
                      variant="secondary" 
                      className="w-full bg-amber-400 text-red-950 hover:bg-amber-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/affiches/${poster.id}`)
                      }}
                    >
                      Voir l'affiche
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_#6b21a8_25%,_transparent_25%,_transparent_75%,_#6b21a8_75%,_#6b21a8),linear-gradient(45deg,_#6b21a8_25%,_transparent_25%,_transparent_75%,_#6b21a8_75%,_#6b21a8)] bg-60 transform rotate-12 scale-150" />
        </div>
      </section>      {/* Notre concept Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-black to-red-950">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="aspect-square rounded-full bg-amber-400 absolute -top-4 -left-4 w-24 h-24"
              />
              <div className="relative z-10 rounded-2xl overflow-hidden">
                {featuredTheaters.length > 0 && featuredTheaters[0].image ? (
                  <Image
                    src={featuredTheaters[0].image}
                    alt="Théâtre vedette"
                    width={600}
                    height={400}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-8xl">🎭</span>
                  </div>
                )}
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="aspect-square rounded-full bg-yellow-400 absolute -bottom-4 -right-4 w-32 h-32"
              />
            </div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold mb-6 text-white">
                  Le Temple du <span className="text-amber-400">Rire</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Découvrez un lieu unique où l&#39;humour prend vie chaque soir. Notre plateforme connecte les plus grands talents du stand-up français avec les théâtres les plus prestigieux.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h3 className="font-bold text-xl mb-2 text-amber-400">
                      {loading ? '...' : popularPosters.length + '+'}
                    </h3>
                    <p className="text-gray-300">Affiches populaires</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">                    <h3 className="font-bold text-xl mb-2 text-amber-400">
                      {loading ? '...' : successfulArtists.length + '+'}
                    </h3>
                    <p className="text-gray-300">Artistes talentueux</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-xl mb-2 text-purple-500">
                      {loading ? '...' : featuredTheaters.length + '+'}
                    </h3>
                    <p className="text-gray-300">Théâtres partenaires</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-xl mb-2 text-green-500">
                      {loading ? '...' : popularPosters.reduce((sum, p) => sum + p.likesCount, 0) + '+'}
                    </h3>
                    <p className="text-gray-300">Likes au total</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>      {/* Théâtres à la une Section */}
      <section className="relative py-24 bg-gradient-to-b from-black to-purple-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_#581c87_25%,_transparent_25%,_transparent_75%,_#581c87_75%,_#581c87),linear-gradient(45deg,_#581c87_25%,_transparent_25%,_transparent_75%,_#581c87_75%,_#581c87)] bg-60 transform rotate-12 scale-150" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Théâtres <span className="text-amber-400">à la Une</span>
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Les salles les plus actives et appréciées de notre plateforme
            </p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredTheaters.slice(0, 2).map((theater, i) => (
                <motion.div
                  key={theater.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="group relative bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-2xl p-8 border border-purple-500/20 hover:border-amber-400/40 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  onClick={() => router.push(`/theatre/${theater.id}`)}
                >
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-400/30">                        {theater.image ? (
                          <Image
                            src={theater.image}
                            alt={theater.name}
                            width={80}
                            height={80}
                            sizes="80px"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center">
                            <span className="text-white text-2xl">🎭</span>
                          </div>
                        )}
                      </div>
                      {/* Badge de position */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center text-black text-sm font-bold">
                        {i + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {theater.name}
                      </h3>
                      <p className="text-purple-200 mb-4 line-clamp-2">
                        {theater.description || "Théâtre partenaire de notre plateforme"}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-1 text-amber-300">
                          <MapPin className="w-4 h-4" />
                          {theater.city || "Paris"}
                        </span>
                        <span className="flex items-center gap-1 text-green-300">
                          <Users className="w-4 h-4" />
                          Actif
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4 text-sm">
                        <span className="flex items-center gap-1 text-pink-300">
                          <Heart className="w-4 h-4" />
                          Membre depuis {new Date(theater.user.joinedAt).getFullYear()}
                        </span>
                        <span className="text-purple-300">
                          {theater.postersCount} affiches
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-purple-950"
              onClick={() => router.push('/theatre')}
            >
              Découvrir tous les théâtres
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Artistes Section */}
      <section className="bg-red-950 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[length:24px_24px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Nos <span className="text-amber-400">Artistes à Succès</span>
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Découvrez les talents qui font vibrer notre plateforme et remportent le plus de succès
            </p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {successfulArtists.slice(0, 8).map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group relative cursor-pointer"
                  onClick={() => router.push(`/comediens/${artist.id}`)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden relative">
                    {artist.image ? (
                      <Image
                        src={artist.image}
                        alt={artist.name}
                        width={300}
                        height={300}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-6xl">🎭</span>
                      </div>
                    )}
                    {/* Badge de succès */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {artist.postersCount}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-1">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-yellow-400 mb-2">
                        {artist.type || 'Humoriste'}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-amber-300">
                          <MapPin className="w-3 h-3" />
                          {artist.city}
                        </span>
                        <span className="text-amber-300">
                          {artist.postersCount} affiches
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-green-300">
                        Membre depuis {new Date(artist.user.joinedAt).getFullYear()}
                      </div>
                    </div>
                  </div>
                  {/* Étoiles pour les top artistes */}
                  {i < 3 && (
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950"
              onClick={() => router.push('/comediens')}
            >
              Voir tous les artistes
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-black via-red-950 to-black">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_#881337_25%,_transparent_25%,_transparent_75%,_#881337_75%,_#881337),linear-gradient(45deg,_#881337_25%,_transparent_25%,_transparent_75%,_#881337_75%,_#881337)] bg-60 transform rotate-12 scale-150 opacity-20" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-zinc-900 to-red-950 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl border border-amber-400/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Rejoignez la famille du <span className="text-amber-400">Comedy Club</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Recevez en avant-première nos actualités, offres spéciales et dates de spectacles exclusifs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full max-w-md rounded-full bg-black/20 border border-amber-400/20 px-6 py-3 text-white placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <Button size="lg" className="w-full sm:w-auto px-8 bg-amber-400 hover:bg-amber-500 text-red-950">
                S{"'"}inscrire à la newsletter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
