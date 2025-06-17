"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { updateTheaterProfile } from "@/app/actions/theater-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Save, User, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [profile, setProfile] = useState({
    theaterName: "",
    description: "",
    address: "",
    city: "",
    postalCode: "",
    capacity: "",
    theaterType: "",
    // Supprimé website temporairement car il n'existe pas dans le schéma
  })

  useEffect(() => {
    // Charger le profil existant
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/theater/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.profile) {
            setProfile({
              theaterName: data.profile.theaterName || "",
              description: data.profile.description || "",
              address: data.profile.address || "",
              city: data.profile.city || "",
              postalCode: data.profile.postalCode || "",
              capacity: data.profile.capacity?.toString() || "",
              theaterType: data.profile.theaterType || "",
            })
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error)
      }
    }
    loadProfile()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await updateTheaterProfile(formData)

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Profil mis à jour avec succès" })
    } else {
      setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour" })
    }

    setIsLoading(false)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard-theatre")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2d0b18] to-[#3a1c4d] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Building2 className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-3xl font-bold text-amber-300">Mon Profil Théâtre</h1>
              <p className="text-gray-300">Gérez les informations de votre établissement</p>
            </div>
          </div>
          <Button
            onClick={handleBackToDashboard}
            variant="outline"
            className="bg-transparent border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
        </div>

        {/* Message de feedback */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-400/20 text-green-400 border border-green-400/30"
                : "bg-red-400/20 text-red-400 border border-red-400/30"
            }`}
          >
            {message.text}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations générales
              </CardTitle>
              <CardDescription className="text-gray-300">Les informations principales de votre théâtre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theaterName" className="text-white">
                    Nom du théâtre *
                  </Label>
                  <Input
                    id="theaterName"
                    name="theaterName"
                    value={profile.theaterName}
                    onChange={(e) => setProfile({ ...profile, theaterName: e.target.value })}
                    className="bg-black/50 border-amber-400/30 text-white"
                    placeholder="Ex: Théâtre de la Comédie"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theaterType" className="text-white">
                    Type de théâtre
                  </Label>
                  <Select
                    name="theaterType"
                    value={profile.theaterType}
                    onValueChange={(value) => setProfile({ ...profile, theaterType: value })}
                  >
                    <SelectTrigger className="bg-black/50 border-amber-400/30 text-white">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theatre-municipal">Théâtre municipal</SelectItem>
                      <SelectItem value="theatre-prive">Théâtre privé</SelectItem>
                      <SelectItem value="centre-culturel">Centre culturel</SelectItem>
                      <SelectItem value="salle-spectacle">Salle de spectacle</SelectItem>
                      <SelectItem value="cafe-theatre">Café-théâtre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white min-h-[100px]"
                  placeholder="Décrivez votre théâtre, son histoire, sa programmation..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-amber-300">Localisation</CardTitle>
              <CardDescription className="text-gray-300">Adresse et informations de localisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">
                  Adresse *
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="123 Rue du Théâtre"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">
                    Ville *
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="bg-black/50 border-amber-400/30 text-white"
                    placeholder="Paris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-white">
                    Code postal *
                  </Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    className="bg-black/50 border-amber-400/30 text-white"
                    placeholder="75001"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Caractéristiques techniques */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-amber-300">Caractéristiques techniques</CardTitle>
              <CardDescription className="text-gray-300">
                Informations sur la capacité et les équipements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-white">
                  Capacité (nombre de places)
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={profile.capacity}
                  onChange={(e) => setProfile({ ...profile, capacity: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="200"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              onClick={handleBackToDashboard}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}