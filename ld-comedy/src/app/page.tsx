'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

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
      </section>

      {/* Featured Section */}
      <section className="relative py-32 bg-red-950 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 md:mb-0">
              Prochains<br />
              <span className="text-amber-400">Spectacles</span>
            </h2>
            <Button variant="outline" size="lg" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-red-950">
              Voir tous les spectacles
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-xl bg-purple-800"
              >
                <div className="relative h-96 overflow-hidden">
                  <Image
                    src={`/images/event-${i}.jpg`}
                    alt="Event"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/50 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-semibold text-red-950">
                      20 Mai
                    </span>
                    <span className="text-amber-400">20h00</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                    Soirée Comedy Club
                  </h3>
                  <p className="text-red-200 mb-4">
                    Une soirée exceptionnelle avec les meilleurs talents du stand-up
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full bg-amber-400 text-red-950 hover:bg-amber-300"
                    onClick={() => router.push('/connexion')}
                  >
                    Réserver
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_#6b21a8_25%,_transparent_25%,_transparent_75%,_#6b21a8_75%,_#6b21a8),linear-gradient(45deg,_#6b21a8_25%,_transparent_25%,_transparent_75%,_#6b21a8_75%,_#6b21a8)] bg-60 transform rotate-12 scale-150" />
        </div>
      </section>

      {/* Notre concept Section */}
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
                <Image
                  src="/images/comedy-stage.jpg"
                  alt="Comedy Stage"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
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
                  Découvrez un lieu unique où l&#39;humour prend vie chaque soir. Notre scène a vu naître les plus grands talents du stand-up français, et continue d&#39;accueillir les étoiles montantes de demain.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-amber-400 pl-4">
                    <h3 className="font-bold text-xl mb-2 text-amber-400">300+</h3>
                    <p className="text-gray-300">Spectacles par an</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-xl mb-2 text-red-500">50+</h3>
                    <p className="text-gray-300">Artistes résidents</p>
                  </div>
                </div>
              </motion.div>
            </div>
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
              Nos <span className="text-amber-400">Artistes</span>
            </h2>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Découvrez les talents qui font vibrer notre scène chaque soir
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative"
              >
                <div className="aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={`/images/artist-${i}.jpg`}
                    alt={`Artist ${i}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg">Artiste {i}</h3>
                    <p className="text-sm text-yellow-400">Humoriste</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
