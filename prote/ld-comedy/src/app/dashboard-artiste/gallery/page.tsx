"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Image as ImageIcon, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import MediaUploader from '@/components/ui/MediaUploader'

export default function GalleryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/connexion")
    }
    loadPhotos()
  }, [status, router])

  const loadPhotos = async () => {
    try {
      // TODO: Implémenter le chargement depuis l'API
      // Pour l'instant, retourne un tableau vide
      setPhotos([])
    } catch (error) {
      console.error("Erreur lors du chargement des photos:", error)
    }
  }

  const handlePhotoUpload = async (url: string) => {
    setIsUploading(true)
    try {
      // TODO: Enregistrer l'URL dans la base de données
      setPhotos(prev => [...prev, url])
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (photoUrl: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return

    try {
      // TODO: Supprimer de la base de données
      setPhotos(prev => prev.filter(p => p !== photoUrl))
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-red-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-red-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard-artiste"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-8 h-8 text-amber-400" />
                Galerie Photos
              </h1>
              <p className="text-gray-400 mt-1">
                Gérez vos photos de spectacles et événements
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Ajouter des photos
          </h2>
          <MediaUploader
            onUploadSuccess={handlePhotoUpload}
            acceptedFileTypes={["image/*"]}
            maxSizeMB={5}
          />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.length === 0 ? (
            <div className="col-span-full bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Aucune photo dans votre galerie
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Ajoutez vos premières photos pour les afficher ici
              </p>
            </div>
          ) : (
            photos.map((photo, index) => (
              <div
                key={index}
                className="group relative bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 overflow-hidden hover:border-amber-400/40 transition-all"
              >
                <div className="aspect-square relative">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedImage(photo)}
                      className="p-3 bg-amber-400 hover:bg-amber-500 text-black rounded-full transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(photo)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-amber-400 hover:bg-amber-500 text-black rounded-full transition-colors"
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
