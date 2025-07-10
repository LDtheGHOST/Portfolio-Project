"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  User, 
  Building, 
  X, 
  ArrowRight,
  Settings,
  Star,
  Calendar,
  Users,
  Shield
} from "lucide-react"
import Link from "next/link"

interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DashboardModal({ isOpen, onClose }: DashboardModalProps) {
  const { user, role } = useAuth()

  if (!user || !role) return null

  const dashboardOptions = [
    {
      id: 'artist',
      title: 'Dashboard Artiste',
      description: 'Gérez votre profil, vos spectacles et vos réservations',
      icon: User,
      color: 'from-blue-500 to-purple-600',
      href: '/dashboard-artiste',
      accessible: role === 'ARTIST' || role === 'ADMIN',
      features: ['Profil artistique', 'Galerie photos', 'Messagerie', 'Statistiques']
    },
    {
      id: 'theater',
      title: 'Dashboard Théâtre',
      description: 'Gérez votre établissement et vos événements',
      icon: Building,
      color: 'from-green-500 to-teal-600',
      href: '/dashboard-theatre',
      accessible: role === 'THEATER' || role === 'ADMIN',
      features: ['Gestion événements', 'Réservations', 'Partenariats', 'Analytics']
    },
    {
      id: 'admin',
      title: 'Dashboard Admin',
      description: 'Administration complète de la plateforme',
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      href: '/dashboard-admin',
      accessible: role === 'ADMIN',
      features: ['Gestion utilisateurs', 'Modération', 'Analytics', 'Configuration']
    }
  ]

  const accessibleDashboards = dashboardOptions.filter(dash => dash.accessible)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <LayoutDashboard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mes Dashboards</h2>
                    <p className="text-sm text-gray-600">
                      Bienvenue {user.name}, choisissez votre espace de travail
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {accessibleDashboards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accessibleDashboards.map((dashboard) => (
                    <motion.div
                      key={dashboard.id}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                    >
                      <Link href={dashboard.href} onClick={onClose}>
                        <Card className="p-6 h-full border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                          <div className="flex flex-col h-full">
                            {/* Icon */}
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${dashboard.color} mb-4 self-start`}>
                              <dashboard.icon className="h-6 w-6 text-white" />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                                {dashboard.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-4">
                                {dashboard.description}
                              </p>
                              
                              {/* Features */}
                              <div className="space-y-2">
                                {dashboard.features.map((feature, index) => (
                                  <div key={index} className="flex items-center text-xs text-gray-500">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Action */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              <span className="text-sm font-medium text-gray-500">
                                Accéder
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
                    <LayoutDashboard className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun dashboard accessible
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous n'avez pas encore accès aux dashboards. Veuillez choisir votre rôle.
                  </p>
                  <Link href="/choix-roles" onClick={onClose}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Choisir mon rôle
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Connecté en tant que {user.name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
