'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Heart,
  Theater
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-400' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-400' }
  ]

  const quickLinks = [
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Conditions', href: '/terms' },
    { name: 'Confidentialité', href: '/privacy' }
  ]

  return (
    <footer className="relative bg-gradient-to-r from-black via-purple-950 to-red-950 text-white border-t border-amber-400/20">
      {/* Bordure supérieure animée */}
      <div className="h-px bg-gradient-to-r from-amber-400 via-red-500 to-purple-500 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo et copyright */}
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-red-500 rounded-lg flex items-center justify-center">
                <Theater className="w-5 h-5 text-red-950 font-bold" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
                LD Comedy
              </span>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-300">© {currentYear} LD Comedy. Tous droits réservés.</p>
              <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start">
                Fait avec <Heart className="w-3 h-3 text-red-400 mx-1" /> à Paris
              </p>
            </div>
          </motion.div>

          {/* Liens rapides */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {quickLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>

          {/* Réseaux sociaux */}
          <motion.div 
            className="flex space-x-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className={`w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 border border-gray-600/30 hover:border-amber-400/50`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Effet de brillance en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
    </footer>
  )
}

// Export par défaut aussi pour compatibilité
export default Footer