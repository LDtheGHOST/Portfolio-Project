'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className={`text-2xl font-bold ${
            isScrolled ? 'text-purple-600' : 'text-white'
          } transition-colors`}>
            LD Comedy
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
          >
            <svg
              className={`h-6 w-6 ${isScrolled ? 'text-gray-600' : 'text-white'}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/comedians"
              className={`font-medium ${
                isScrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/90 hover:text-white'
              } transition-colors`}
            >
              Comédiens
            </Link>
            <Link
              href="/events"
              className={`font-medium ${
                isScrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/90 hover:text-white'
              } transition-colors`}
            >
              Événements
            </Link>
            <Link
              href="/about"
              className={`font-medium ${
                isScrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/90 hover:text-white'
              } transition-colors`}
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className={`font-medium ${
                isScrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/90 hover:text-white'
              } transition-colors`}
            >
              Contact
            </Link>
            <Button
              variant={isScrolled ? 'primary' : 'outline'}
              size="sm"
              className={!isScrolled ? 'text-white border-white hover:bg-white/10' : ''}
            >
              Réserver
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg mt-2 shadow-lg">
            <Link
              href="/comedians"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
            >
              Comédiens
            </Link>
            <Link
              href="/events"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
            >
              Événements
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
            >
              À propos
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
            >
              Contact
            </Link>
            <div className="px-3 py-2">
              <Button variant="primary" size="sm" className="w-full">
                Réserver
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
