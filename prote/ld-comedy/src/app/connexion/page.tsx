"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent, useEffect, Suspense } from "react"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

function ConnexionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Gestion des messages de redirection
    const message = searchParams.get("message")
    const verified = searchParams.get("verified")
    const errorParam = searchParams.get("error")

    if (message === "inscription-reussie") {
      setSuccess("🎉 Inscription réussie ! Vous pouvez maintenant vous connecter.")
    } else if (verified === "true") {
      setSuccess("✅ Email vérifié avec succès ! Vous pouvez maintenant vous connecter.")
    } else if (errorParam === "verification_failed") {
      setError("❌ Erreur de vérification. Veuillez réessayer ou demander un nouveau lien.")
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role && session.user.role !== "PENDING") {
        switch (session.user.role) {
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
        router.push("/choix-roles")
      }
    }
  }, [session, status, router])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case "CredentialsSignin":
            setError("❌ Email ou mot de passe incorrect")
            break
          case "EmailNotVerified":
            setError("📧 Email non vérifié. Veuillez vérifier votre boîte mail.")
            break
          default:
            setError("❌ Erreur de connexion. Veuillez réessayer.")
        }
      } else {
        setSuccess("✅ Connexion réussie! Redirection en cours...")
      }
    } catch (error) {
      setError("❌ Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }
  if (status === "authenticated") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-red-950 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-black/40 backdrop-blur-md rounded-xl p-8 border border-amber-400/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white font-medium">Redirection vers votre dashboard...</p>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-red-950 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo et titre */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-2xl mb-6 shadow-2xl"
            >
              <span className="text-2xl">🎭</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Bon retour !
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-amber-200"
            >
              Connectez-vous à votre compte LD Comedy
            </motion.p>
          </div>          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-amber-400/30 shadow-2xl"
          >
            {/* Messages d'état */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl p-4 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Champ Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-amber-200 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>              {/* Champ Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-amber-200 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-red-950 font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>            {/* Liens supplémentaires */}
            <div className="mt-8 pt-6 border-t border-amber-400/20">
              <div className="text-center space-y-3">
                <p className="text-amber-200 text-sm">
                  Pas encore de compte ?{" "}
                  <Link 
                    href="/register" 
                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    Créer un compte
                  </Link>
                </p>
                
                <p className="text-gray-400 text-xs">
                  Email non vérifié ?{" "}
                  <Link 
                    href="/resend-verification" 
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Renvoyer l'email de vérification
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm">
              © 2025 LD Comedy - Plateforme de comédie
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default function Connexion() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-red-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-black/40 backdrop-blur-md rounded-xl p-8 border border-amber-400/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white font-medium">Chargement...</p>
        </motion.div>
      </main>
    }>
      <ConnexionContent />
    </Suspense>
  )
}
