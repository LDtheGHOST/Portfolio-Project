"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Trash2, Eye, CheckCircle, AlertCircle } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: "pending" | "approved" | "rejected"
  category: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Licence d'entrepreneur de spectacles.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      status: "approved",
      category: "Licence",
    },
    {
      id: "2",
      name: "Assurance responsabilité civile.pdf",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "2024-01-10",
      status: "pending",
      category: "Assurance",
    },
  ])

  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulation d'upload
    setTimeout(() => {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        status: "pending",
        category: "Autre",
      }

      setDocuments((prev) => [...prev, newDocument])
      setIsUploading(false)
    }, 2000)
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approuvé"
      case "rejected":
        return "Rejeté"
      default:
        return "En attente"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-400/20 text-green-400"
      case "rejected":
        return "bg-red-400/20 text-red-400"
      default:
        return "bg-yellow-400/20 text-yellow-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2d0b18] to-[#3a1c4d] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <FileText className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold text-amber-300">Documents</h1>
            <p className="text-gray-300">Gérez vos documents officiels et justificatifs</p>
          </div>
        </div>

        {/* Upload de documents */}
        <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
          <CardHeader>
            <CardTitle className="text-amber-300">Ajouter un document</CardTitle>
            <CardDescription className="text-gray-300">
              Téléchargez vos documents officiels (licence, assurance, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document" className="text-white">
                Sélectionner un fichier
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="bg-black/50 border-amber-400/30 text-white file:bg-amber-400 file:text-black file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                  disabled={isUploading}
                />
                {isUploading && (
                  <div className="flex items-center text-amber-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-400 mr-2"></div>
                    Téléchargement...
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
          </CardContent>
        </Card>

        {/* Documents requis */}
        <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
          <CardHeader>
            <CardTitle className="text-amber-300">Documents requis</CardTitle>
            <CardDescription className="text-gray-300">
              Liste des documents nécessaires pour valider votre profil théâtre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Licence d'entrepreneur de spectacles</h4>
                <p className="text-sm text-gray-300">Obligatoire pour organiser des spectacles payants</p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Assurance responsabilité civile</h4>
                <p className="text-sm text-gray-300">Couverture pour les événements organisés</p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Statuts de l'association/société</h4>
                <p className="text-sm text-gray-300">Documents légaux de votre structure</p>
              </div>
              <div className="p-4 bg-black/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Justificatif d'adresse</h4>
                <p className="text-sm text-gray-300">Preuve de domiciliation de votre théâtre</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <Card className="bg-white/10 backdrop-blur-md border-amber-400/30">
          <CardHeader>
            <CardTitle className="text-amber-300">Mes documents ({documents.length})</CardTitle>
            <CardDescription className="text-gray-300">
              Documents téléchargés et leur statut de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">Aucun document téléchargé</p>
                <p className="text-sm text-gray-400 mt-2">Commencez par télécharger vos documents officiels</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg hover:bg-black/40 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-amber-400" />
                      <div>
                        <h4 className="font-medium text-white">{doc.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Téléchargé le {new Date(doc.uploadDate).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}
                      >
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium">{getStatusText(doc.status)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
