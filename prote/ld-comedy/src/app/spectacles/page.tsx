'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TheaterProfile {
  id: string;
  capacity: number | null;
  theaterName: string | null;
  stageType: string | null;
  facilities: string[];
  programmingTypes: string[];
  coverImage: string | null;
  isVerified: boolean;
  totalEvents: number;
  totalArtists: number;
  averageRating: number | null;
}

interface Theatre {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  phoneNumber: string | null;
  theaterProfile: TheaterProfile | null;
}

export default function Spectacles() {
  const router = useRouter()
  const [theatres, setTheatres] = useState<Theatre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        const response = await fetch('/api/theatres')
        const data = await response.json()
        setTheatres(data)
      } catch (error) {
        console.error('Error fetching theatres:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTheatres()
  }, [])

  return (
    <main>
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
              Nos <span className="text-amber-400">Théâtres Partenaires</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Découvrez nos salles de spectacle partenaires
            </p>
          </motion.div>
        </div>
      </section>

      {/* Theatres Grid */}
      <section className="py-20 bg-red-950">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-white">Chargement...</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {theatres.map((theatre) => (
                <motion.div
                  key={theatre.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-xl bg-black/30"
                >
                  <div className="relative h-96 overflow-hidden">
                    <Image
                      src={theatre.theaterProfile?.coverImage || theatre.profileImage || '/ld_show.png'}
                      alt={theatre.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/50 to-transparent" />
                    {theatre.theaterProfile?.isVerified && (
                      <div className="absolute top-4 right-4 bg-amber-400 text-red-950 px-2 py-1 rounded-full text-xs font-semibold">
                        Vérifié
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-red-950">
                        {theatre.city || 'Ville non spécifiée'}
                      </span>
                      {theatre.theaterProfile?.capacity && (
                        <span className="rounded-full bg-red-900 px-3 py-1 text-sm text-white">
                          {theatre.theaterProfile.capacity} places
                        </span>
                      )}
                      {theatre.theaterProfile?.stageType && (
                        <span className="rounded-full bg-red-900/70 px-3 py-1 text-sm text-white">
                          {theatre.theaterProfile.stageType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {theatre.theaterProfile?.theaterName || theatre.name}
                    </h3>
                    <div className="text-sm text-amber-400 mb-2">
                      Capacité : {theatre.theaterProfile?.capacity || 'Non spécifiée'} places
                    </div>
                    <Button 
                      onClick={() => router.push(`/theatre/${theatre.theaterProfile?.id}`)}
                      className="mt-4 bg-amber-400 text-red-950 hover:bg-amber-500"
                    >
                      Voir plus de détails
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
