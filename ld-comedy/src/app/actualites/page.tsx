'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Actualites() {
  const news = [
    {
      id: 1,
      title: "Festival du Rire - Édition 2025",
      date: "15 Juin 2025",
      image: "/images/event-1.jpg",
      excerpt: "Notre comedy club accueillera le Festival du Rire 2025, réunissant les plus grands noms de l&apos;humour français pendant une semaine exceptionnelle.",
      category: "Événement"
    },
    {
      id: 2,
      title: "Nouveau spectacle de Sarah Martin",
      date: "10 Mai 2025",
      image: "/images/artist-1.jpg",
      excerpt: "Notre artiste résidente Sarah Martin présentera son nouveau spectacle &quot;Rire sans filtre&quot; tous les jeudis à partir du mois prochain.",
      category: "Spectacle"
    },
    {
      id: 3,
      title: "Les Soirées Découvertes font leur retour",
      date: "1 Mai 2025",
      image: "/images/event-3.jpg",
      excerpt: "Chaque lundi, venez découvrir les nouveaux talents de la scène humoristique lors de nos soirées découvertes.",
      category: "Programme"
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
              Nos <span className="text-amber-400">Actualités</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Restez informés des dernières nouvelles et événements de votre comedy club préféré
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20 bg-red-950">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-black/30 rounded-xl overflow-hidden group"
              >
                <div className="relative h-64">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-400 text-red-950 px-3 py-1 rounded-full text-sm font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-amber-400 text-sm">{item.date}</span>
                  <h2 className="text-2xl font-bold text-white mt-2 mb-4 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {item.excerpt}
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950"
                  >
                    Lire la suite
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-b from-red-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Restez <span className="text-amber-400">Informés</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Inscrivez-vous à notre newsletter pour ne manquer aucune actualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 max-w-md rounded-full bg-black/20 border border-amber-400/20 px-6 py-3 text-white placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <Button 
                size="lg"
                className="bg-amber-400 text-red-950 hover:bg-amber-300"
              >
                S&apos;inscrire
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
