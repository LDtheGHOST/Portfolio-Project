"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MediaUploader from '@/components/ui/MediaUploader';
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

export default function AffichesTheatre() {
  const { data: session, status } = useSession();
  const [affiches, setAffiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [theaterProfileId, setTheaterProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Charger les affiches existantes depuis l'API (à implémenter)
    // fetch('/api/theatre/affiches')

    // Charger l'ID du profil théâtre
    if (status === "authenticated") {
      fetch("/api/theater/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile?.id) {
            setTheaterProfileId(data.profile.id);
          }
        })
        .catch((err) => console.error("Erreur profil:", err));
    }
  }, [status]);

  const handleMediaUpload = async (files: File[]) => {
    // Upload sur Cloudinary déjà géré dans MediaUploader
    // Ici, on récupère les URLs et on les sauvegarde côté serveur (API à implémenter)
    setLoading(true);
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    // Appel à une API pour sauvegarder les URLs dans la base (à faire)
    setAffiches(prev => [...prev, ...urls]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-900/95 to-black border-b border-amber-400/30 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard-theatre"
              className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-400/30 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Mon espace</span>
            </Link>
            <div className="border-l border-gray-700 pl-3">
              <h1 className="text-lg md:text-xl font-bold text-amber-400">Mes affiches</h1>
              <p className="text-xs text-gray-400 hidden md:block">Gérez vos affiches de spectacles</p>
            </div>
          </div>

          {/* Bouton Voir mon profil */}
          {theaterProfileId && (
            <Link
              href={`/theatre/${theaterProfileId}`}
              className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-2 rounded-lg flex items-center transition-all duration-200 text-sm font-semibold shadow-lg hover:scale-105"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Profil public</span>
              <span className="md:hidden">Public</span>
            </Link>
          )}
        </div>
      </header>

      {/* Contenu */}
      <div className="container mx-auto py-8 px-4">
        <MediaUploader onUpload={handleMediaUpload} accept="image/*" multiple={true} />
        {loading && <div className="text-amber-400 mt-2">Envoi en cours...</div>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {affiches.map((url, idx) => (
            <img key={idx} src={url} alt={`Affiche ${idx + 1}`} className="rounded shadow border border-amber-400/30 object-cover w-full h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}
