'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Artistes() {
  const artists = [
    {
      id: 1,
      name: "Sarah Martin",
      image: "/images/artist-1.jpg",
      specialty: "Stand-up & Improvisation",
      description: "Révélation de l'année, Sarah enchante le public avec son humour décapant et sa présence scénique unique.",
      social: {
        instagram: "#",
        twitter: "#",
        youtube: "#"
      }
    },
    {
      id: 2,
      name: "David Torres",
      image: "/images/artist-2.jpg",
      specialty: "Comédie & One-man-show",
      description: "Avec plus de 10 ans d'expérience, David est devenu une référence dans le monde du stand-up français.",
      social: {
        instagram: "#",
        twitter: "#",
        youtube: "#"
      }
    },
    {
      id: 3,
      name: "Julie Chen",
      image: "/images/artist-3.jpg",
      specialty: "Humour Musical",
      description: "Mêlant musique et humour, Julie crée des performances uniques qui ne manquent jamais de faire rire.",
      social: {
        instagram: "#",
        twitter: "#",
        youtube: "#"
      }
    },
    {
      id: 4,
      name: "Marc Dubois",
      image: "/images/artist-4.jpg",
      specialty: "Stand-up",
      description: "Nouveau talent prometteur, Marc se démarque par son style unique et ses observations pertinentes.",
      social: {
        instagram: "#",
        twitter: "#",
        youtube: "#"
      }
    }
  ]

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
          <div className="grid gap-12 md:grid-cols-2">
            {artists.map((artist) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row gap-8 bg-black/30 rounded-xl p-6"
              >
                <div className="relative w-full md:w-64 h-64 rounded-xl overflow-hidden">
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{artist.name}</h2>
                  <p className="text-amber-400 font-semibold mb-4">{artist.specialty}</p>
                  <p className="text-gray-300 mb-6">{artist.description}</p>
                  <div className="flex gap-4">
                    <Button 
                      variant="secondary" 
                      className="bg-amber-400 text-red-950 hover:bg-amber-300"
                    >
                      Voir les dates
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950"
                    >
                      Plus d&#39;infos
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
            <Button 
              size="lg"
              className="bg-amber-400 text-red-950 hover:bg-amber-300"
            >
              Nous contacter
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
