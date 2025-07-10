"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { updateTheaterProfile, addTheaterPoster, getTheaterProfile } from "@/app/actions/theater-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Save, User, ArrowLeft } from "lucide-react"
import MediaUploader from '@/components/ui/MediaUploader'

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
  const [gallery, setGallery] = useState<string[]>([])
  const [coverImage, setCoverImage] = useState<string>("")

  useEffect(() => {
    // Charger le profil existant
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/theater/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setProfile({
              theaterName: data.profile.theaterName || "",
              description: data.profile.description || "",
              address: data.profile.address || "",
              city: data.profile.city || "",
              postalCode: data.profile.postalCode || "",
              capacity: data.profile.capacity?.toString() || "",
              theaterType: data.profile.theaterType || "",
            });
            setGallery(data.profile.galleryImages || []);
            setCoverImage(data.profile.coverImage || "");
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      }
    };
    loadProfile();
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

  const handleMediaUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        // Ajoute l'affiche à la galerie côté serveur
        await addTheaterPoster(data.url)
        setGallery((prev) => [...prev, data.url])
      }
    }
  }

  const handleProfileImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      // Met à jour la photo de profil côté serveur
      await fetch("/api/theater/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: data.url }),
      });
      setCoverImage(data.url);
    }
  };

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
          <Card className="bg-gradient-to-br from-black via-[#2d0b18] to-[#3a1c4d] border border-amber-400/40 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-extrabold text-amber-400 flex items-center gap-2">
                <User className="w-7 h-7" />
                Informations générales
              </CardTitle>
              <CardDescription className="text-lg text-gray-200 mt-2">Complétez les informations principales de votre théâtre pour une page publique attractive.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="theaterName" className="text-lg text-amber-300 font-semibold">
                    Nom du théâtre <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="theaterName"
                    name="theaterName"
                    value={profile.theaterName}
                    onChange={(e) => setProfile({ ...profile, theaterName: e.target.value })}
                    className="bg-black/60 border-2 border-amber-400/40 focus:border-amber-400 text-white px-5 py-3 rounded-xl text-lg shadow-inner transition-all"
                    placeholder="Ex: Théâtre de la Comédie"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="theaterType" className="text-lg text-amber-300 font-semibold">
                    Type de théâtre
                  </Label>
                  <Select
                    name="theaterType"
                    value={profile.theaterType}
                    onValueChange={(value) => setProfile({ ...profile, theaterType: value })}
                  >
                    <SelectTrigger className="bg-black/60 border-2 border-amber-400/40 focus:border-amber-400 text-white px-5 py-3 rounded-xl text-lg shadow-inner transition-all">
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
              <div className="space-y-4 mt-8">
                <Label htmlFor="description" className="text-lg text-amber-300 font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="bg-black/60 border-2 border-amber-400/40 focus:border-amber-400 text-white px-5 py-3 rounded-xl text-lg shadow-inner min-h-[120px] transition-all"
                  placeholder="Décrivez votre théâtre, son histoire, sa programmation..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section moderne pour la photo de profil */}
          <div className="flex flex-col items-center gap-4 my-8">
            <div className="relative">
              <img
                src={coverImage || "/ld_show.png"}
                alt="Photo de profil du théâtre"
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-400 shadow-lg"
              />
            </div>
            <MediaUploader onUpload={handleProfileImageUpload} accept="image/*" multiple={false} />
            <span className="text-xs text-gray-400">Format recommandé : carré, max 2Mo</span>
          </div>

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