"use client"

import { useState, useEffect } from "react"
import { updateSocialLinks } from "@/app/actions/theater-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, Facebook, Instagram, Youtube, Music, Globe, Save } from "lucide-react"

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    website: "",
  })

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        const response = await fetch("/api/theater/profile")
        if (response.ok) {
          const data = await response.json()
          if (data.profile?.socialLinks) {
            setSocialLinks({
              facebook: data.profile.socialLinks.facebook || "",
              instagram: data.profile.socialLinks.instagram || "",
              youtube: data.profile.socialLinks.youtube || "",
              tiktok: data.profile.socialLinks.tiktok || "",
              website: data.profile.socialLinks.website || "",
            })
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des liens sociaux:", error)
      }
    }
    loadSocialLinks()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await updateSocialLinks(formData)

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Liens mis à jour avec succès" })
    } else {
      setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour" })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2d0b18] to-[#3a1c4d] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Mail className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold text-amber-300">Contact & Réseaux Sociaux</h1>
            <p className="text-gray-300">Gérez vos liens et informations de contact</p>
          </div>
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
          {/* Réseaux sociaux */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-amber-300">Réseaux Sociaux</CardTitle>
              <CardDescription className="text-gray-300">
                Ajoutez vos liens vers les réseaux sociaux pour améliorer votre visibilité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-white flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="https://www.facebook.com/montheatre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-white flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="https://www.instagram.com/montheatre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-white flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  name="youtube"
                  type="url"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="https://www.youtube.com/montheatre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-black bg-white rounded" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  name="tiktok"
                  type="url"
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="https://www.tiktok.com/@montheatre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" />
                  Site Web
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  className="bg-black/50 border-amber-400/30 text-white"
                  placeholder="https://www.montheatre.fr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Aperçu des liens */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
            <CardHeader>
              <CardTitle className="text-amber-300">Aperçu</CardTitle>
              <CardDescription className="text-gray-300">
                Vos liens tels qu'ils apparaîtront aux visiteurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Facebook className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-xs text-white">Facebook</span>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-pink-500/20 rounded-lg hover:bg-pink-500/30 transition-colors"
                  >
                    <Instagram className="w-6 h-6 text-pink-500 mb-2" />
                    <span className="text-xs text-white">Instagram</span>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Youtube className="w-6 h-6 text-red-500 mb-2" />
                    <span className="text-xs text-white">YouTube</span>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-gray-500/20 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    <Music className="w-6 h-6 text-white mb-2" />
                    <span className="text-xs text-white">TikTok</span>
                  </a>
                )}
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 bg-amber-500/20 rounded-lg hover:bg-amber-500/30 transition-colors"
                  >
                    <Globe className="w-6 h-6 text-amber-400 mb-2" />
                    <span className="text-xs text-white">Site Web</span>
                  </a>
                )}
              </div>
              {!Object.values(socialLinks).some((link) => link) && (
                <p className="text-gray-400 text-center py-8">Aucun lien configuré pour le moment</p>
              )}
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
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
