"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Building, ArrowRight, Check } from "lucide-react"

// Définition des types
type Role = "ARTIST" | "THEATER"

interface RoleOption {
  id: Role
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  features: string[]
}

const roles: RoleOption[] = [
  {
    id: "ARTIST",
    title: "Artiste",
    description: "Comédien, humoriste, artiste de spectacle",
    icon: Mic,
    gradient: "from-purple-500 to-pink-500",
    features: [
      "Créer votre portfolio artistique",
      "Partager vos vidéos et photos",
      "Être découvert par des professionnels",
      "Postuler à des castings",
      "Gérer vos disponibilités",
    ],
  },
  {
    id: "THEATER",
    title: "Théâtre",
    description: "Salle de spectacle, théâtre, café-théâtre",
    icon: Building,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      "Présenter votre salle et programmation",
      "Découvrir de nouveaux talents",
      "Organiser des castings",
      "Gérer vos événements",
      "Publier vos spectacles",
    ],
  },
]

export default function ChoixRoles() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelection = async () => {
    if (!selectedRole || !session?.user?.email) return
  
    setIsLoading(true)
    setError(null)
  
    try {
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })
  
      if (response.ok) {
        // Mettre à jour la session avec le nouveau rôle
        await update({role: selectedRole})
  
        // Rediriger vers le dashboard approprié
        switch (selectedRole) {
          case "ARTIST":
            router.push("/dashboard-artiste")
            break
          case "THEATER":
            router.push("/dashboard-theatre")
            break
          default:
            router.push("/")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erreur lors de la sélection du rôle")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Une erreur est survenue lors de la sélection du rôle")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-red-950">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Bienvenue sur LD Comedy ! 🎭
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Pour personnaliser votre expérience, dites-nous qui vous êtes
            </motion.p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4 mb-8 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Cartes de rôles */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {roles.map((role, index) => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`relative cursor-pointer transition-all duration-300 ${
                    isSelected ? "scale-105" : "hover:scale-102"
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div
                    className={`bg-black/30 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 h-full ${
                      isSelected
                        ? "border-amber-400 shadow-lg shadow-amber-400/20"
                        : "border-amber-400/20 hover:border-amber-400/40"
                    }`}
                  >
                    {/* Icône et titre */}
                    <div className="text-center mb-6">
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{role.title}</h3>
                      <p className="text-gray-300 text-base">{role.description}</p>
                    </div>

                    {/* Fonctionnalités */}
                    <ul className="space-y-3 mb-6">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-300">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Indicateur de sélection */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-black" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bouton Continuer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || isLoading}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                  Configuration en cours...
                </div>
              ) : (
                <div className="flex items-center">
                  Continuer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              )}
            </Button>

            {selectedRole && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-gray-400 text-sm mt-4"
              >
                Vous avez sélectionné :{" "}
                <span className="text-amber-400 font-medium">
                  {roles.find((r) => r.id === selectedRole)?.title}
                </span>
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}