"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, Upload, FileText, Trash2, Download, File } from "lucide-react"
import Link from "next/link"
import MediaUploader from '@/components/ui/MediaUploader'

interface Document {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: Date
}

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/connexion")
    }
    loadDocuments()
  }, [status, router])

  const loadDocuments = async () => {
    try {
      // TODO: Implémenter le chargement depuis l'API
      // Pour l'instant, retourne un tableau vide
      setDocuments([])
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error)
    }
  }

  const handleDocumentUpload = async (url: string) => {
    setIsUploading(true)
    try {
      // TODO: Enregistrer le document dans la base de données
      const newDoc: Document = {
        id: Date.now().toString(),
        name: "Document sans titre",
        url,
        type: "application/pdf",
        size: 0,
        uploadedAt: new Date()
      }
      setDocuments(prev => [...prev, newDoc])
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return

    try {
      // TODO: Supprimer de la base de données
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
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
                <FileText className="w-8 h-8 text-amber-400" />
                Documents
              </h1>
              <p className="text-gray-400 mt-1">
                Gérez vos documents professionnels (CV, book, contrats...)
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Ajouter un document
          </h2>
          <MediaUploader
            onUploadSuccess={handleDocumentUpload}
            accept="application/pdf,.doc,.docx,.txt"
            multiple={true}
          />
          <p className="text-gray-500 text-sm mt-3">
            Formats acceptés : PDF, DOC, DOCX, TXT (max 10 MB)
          </p>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Aucun document ajouté
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Téléchargez votre CV, book ou autres documents professionnels
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-black/30 backdrop-blur-sm rounded-xl border border-amber-400/20 p-6 hover:border-amber-400/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-amber-400/10 rounded-lg">
                      <File className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg transition-colors"
                      title="Télécharger"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
      </div>
    </div>
  )
}
