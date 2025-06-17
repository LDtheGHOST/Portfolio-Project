"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent, useEffect } from "react"

export default function Connexion() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("Session status:", status)
    console.log("Session data:", session)
    if (session?.user) {
      console.log("User role:", session.user.role)
    }
  }, [session, status])

  useEffect(() => {
    const message = searchParams.get("message")
    if (message === "inscription-reussie") {
      setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.")
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("User authenticated, checking role...")
      console.log("Current role:", session.user.role)

      if (session.user.role && session.user.role !== "PENDING") {
        console.log("User has role, redirecting to dashboard...")
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
        console.log("No role or PENDING role, redirecting to role selection")
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

    console.log("Attempting to sign in with email:", email)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        console.log("Sign in error:", result.error)
        setError(result.error)
      } else {
        console.log("Sign in successful")
        setSuccess("Connexion réussie! Redirection en cours...")
      }
    } catch (error) {
      console.error("Sign in exception:", error)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  if (status === "authenticated") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white">Redirection en cours...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-red-950">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-amber-400/20"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-gray-300">Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">{error}</div>}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 mb-6">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-400 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="vous@exemple.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-400 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </Button>

            <p className="text-center text-gray-300">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-amber-400 hover:text-amber-300">
                Inscrivez-vous
              </Link>
            </p>
          </form>

          {/* Debug info en développement */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg text-xs text-gray-400">
              <p>Debug Info:</p>
              <p>Status: {status}</p>
              <p>Role: {session?.user?.role || "undefined"}</p>
              <p>User ID: {session?.user?.id || "undefined"}</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
