"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MediaUploader from '@/components/ui/MediaUploader';

export default function AffichesTheatre() {
  const { data: session, status } = useSession();
  const [affiches, setAffiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger les affiches existantes depuis l'API (à implémenter)
    // fetch('/api/theatre/affiches')
  }, []);

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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-amber-400">Mes affiches</h1>
      <MediaUploader onUpload={handleMediaUpload} accept="image/*" multiple={true} />
      {loading && <div className="text-amber-400 mt-2">Envoi en cours...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {affiches.map((url, idx) => (
          <img key={idx} src={url} alt={`Affiche ${idx + 1}`} className="rounded shadow border border-amber-400/30 object-cover w-full h-48" />
        ))}
      </div>
    </div>
  );
}
