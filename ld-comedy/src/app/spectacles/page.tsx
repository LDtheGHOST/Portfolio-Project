'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Spectacles() {
  const router = useRouter()
  const shows = [
    {
      id: 1,
      title: "Soirée Comedy Club",
      date: "20 Mai",
      time: "20h00",
      image: "/images/event-1.jpg",
      description: "Une soirée exceptionnelle avec les meilleurs talents du stand-up",
      price: "À partir de 20€"
    },
    {
      id: 2,
      title: "Stand-up All Stars",
      date: "21 Mai",
      time: "21h00",
      image: "/images/event-2.jpg",
      description: "Les stars montantes du stand-up français réunies sur une même scène",
      price: "À partir de 25€"
    },
    {
      id: 3,
      title: "Open Mic Night",
      date: "22 Mai",
      time: "19h30",
      image: "/images/event-3.jpg",
      description: "Découvrez les nouveaux talents de la scène comique",
      price: "À partir de 15€"
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
              Nos <span className="text-amber-400">Spectacles</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Découvrez notre programmation variée et laissez-vous emporter par le talent de nos artistes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-20 bg-red-950">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {shows.map((show) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-xl bg-black/30"
              >
                <div className="relative h-96 overflow-hidden">
                  <Image
                    src={show.image}
                    alt={show.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-red-950">
                      {show.date}
                    </span>
                    <span className="text-amber-400">{show.time}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                    {show.title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {show.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-semibold">{show.price}</span>
                    <Button 
                      variant="secondary" 
                      className="bg-amber-400 text-red-950 hover:bg-amber-300"
                      onClick={() => router.push('/connexion')}
                    >
                      Réserver
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-red-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Questions <span className="text-amber-400">Fréquentes</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Comment réserver mes places ?",
                answer: "Vous pouvez réserver directement en ligne en cliquant sur le bouton 'Réserver' du spectacle de votre choix, ou par téléphone."
              },
              {
                question: "Y a-t-il un âge minimum requis ?",
                answer: "La plupart de nos spectacles sont accessibles à partir de 16 ans. Certains spectacles peuvent avoir des restrictions d'âge différentes."
              },
              {
                question: "Quelle est la politique d'annulation ?",
                answer: "Les billets peuvent être remboursés jusqu'à 48h avant le spectacle. Passé ce délai, aucun remboursement ne sera possible."
              },
              {
                question: "Y a-t-il une consommation minimum ?",
                answer: "Non, il n'y a pas de consommation minimum requise. Une carte de boissons et snacks est disponible sur place."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-red-950/50 rounded-xl p-6 border border-amber-400/20"
              >
                <h3 className="text-xl font-bold text-amber-400 mb-3">{item.question}</h3>
                <p className="text-gray-300">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
