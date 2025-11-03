// Ce fichier affiche le profil public d'un artiste/comédien (infos, galerie d'affiches, etc.)
// On utilise l'API /api/artist/[id] pour récupérer les données
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import FriendButton from '@/components/FriendButton';
import MediaUploader from "@/components/ui/MediaUploader"
import { User, MapPin, Users, Star, Facebook, Instagram, Globe, Youtube, Pencil, X, MessageCircle, Heart, Camera, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ComedienPublicPage() {
  const { id } = useParams<{ id: string }>()

  const { data: session } = useSession();
  const [artist, setArtist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [posters, setPosters] = useState<any[]>([])
  const [selectedPoster, setSelectedPoster] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [likes, setLikes] = useState<string[]>([])
  const [likeLoading, setLikeLoading] = useState(false);
  const [comment, setComment] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [newPoster, setNewPoster] = useState({ imageUrl: "", description: "" });
  const [posterLoading, setPosterLoading] = useState(false);

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/comedians/${id}`)
      .then((res) => res.json())      .then((data) => {
        if (data.error) setError(data.error);
        else {
          console.log('API /api/comedians response:', data);
          console.log('coverImage from API:', data.coverImage);
          setArtist({
            ...data,
            specialty: Array.isArray(data.specialties) ? data.specialties.join(', ') : data.specialty || '',
            coverImage: data.coverImage || '',
            region: data.region || '',
            // Harmonise la récupération de la photo de profil
            profileImage: data.profileImage || data.user?.profileImage || '',
            // Assure-toi que socialLinks est disponible à la racine
            socialLinks: data.socialLinks || data.user?.socialLinks || {},          })
          console.log('Posters reçus de l\'API:', data.posters);
          setPosters(data.posters || [])
          setIsOwner(data.isOwner || false)
          console.log('isOwner:', data.isOwner)
          // Ajout debug session et artist
          console.log('session.user.id:', session?.user?.id)
          console.log('artist.user.id:', data.user?.id)
          if (!data.isOwner && session?.user?.id && data.user?.id && session.user.id === data.user.id) {
            alert('Vous êtes connecté en tant que propriétaire, mais isOwner est false. Vérifiez l\'API !')
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Erreur lors du chargement")
        setLoading(false)
      })
  }, [id, session])

  // Ouvre la modale d'affiche et charge les commentaires/likes à jour
  const handleOpenPoster = async (posterId: any) => {
    setSelectedPoster(null)
    try {
      const res = await fetch(`/api/poster?id=${posterId}`)
      if (!res.ok) return
      const data = await res.json()
      setSelectedPoster({ ...data })
      setComments(data.comments || [])
      setLikes(data.likes || [])
    } catch {}
  }

  // Like instantané (toggle, un seul like par user authentifié)
  const handleLike = async () => {
    if (!selectedPoster?.id) return;
    // Utilise l'id utilisateur authentifié si dispo, sinon "demo-user"
    const userId = session?.user?.id || "demo-user";
    setLikeLoading(true);
    const alreadyLiked = likes.includes(userId);
    setLikes((prev: string[]) => alreadyLiked ? prev.filter(id => id !== userId) : [...prev, userId]);
    setSelectedPoster((prev: typeof selectedPoster) => prev ? { ...prev, likes: alreadyLiked ? (prev.likes || []).filter((id: string) => id !== userId) : [...(prev.likes || []), userId] } : prev);
    try {
      const body = JSON.stringify({ posterId: selectedPoster.id });
      await fetch(`/api/poster-like`, {
        method: alreadyLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch {}
    setLikeLoading(false);
  };

  // Ajout d'un commentaire (optimiste, pas d'auth ici)
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !selectedPoster?.id) return
    const optimisticComment = {
      user: { name: "Visiteur", profileImage: null },
      text: comment,
      date: new Date().toLocaleString(),
    }
    setComments((prev: typeof comments) => [...prev, optimisticComment])
    setSelectedPoster((prev: typeof selectedPoster) => prev ? { ...prev, comments: [...(prev.comments || []), optimisticComment] } : prev)
    setComment("")
    try {
      const body = JSON.stringify({ posterId: selectedPoster.id, text: comment })
      await fetch(`/api/poster-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      })
    } catch {}
  }
  // Ouvre la modale d'édition
  const handleOpenEdit = () => {
    setEditProfile({
      name: artist?.user?.name || "",
      bio: artist?.bio || "",
      specialty: artist?.specialty || "",
      region: artist?.region || "",
      profileImage: artist?.profileImage || artist?.user?.profileImage || "",
      coverImage: artist?.coverImage || "",
      socialLinks: artist?.socialLinks || {},
    })
    setEditModalOpen(true)
  }

  // Gère la soumission du formulaire d'édition
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      // Nettoie socialLinks pour n'envoyer que les liens non vides
      const cleanSocialLinks: Record<string, string> = {};
      if (editProfile.socialLinks) {
        Object.entries(editProfile.socialLinks).forEach(([key, value]) => {
          if (typeof value === 'string' && value.trim() !== '') {
            cleanSocialLinks[key] = value.trim();
          }
        });
      }
      const payload: any = {
        id,
        ...editProfile,
        specialties: editProfile.specialty ? editProfile.specialty.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        region: editProfile.region,
        bio: editProfile.bio,        coverImage: editProfile.coverImage,
        profileImage: editProfile.profileImage,
        socialLinks: cleanSocialLinks,
        name: editProfile.name,
      };
      delete payload.specialty // On n'envoie pas specialty (string)
      const res = await fetch(`/api/artist/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json()
        console.log('PATCH response:', data);
        // Mise à jour complète du state artist avec tous les champs de la réponse
        setArtist({
          ...artist, // Garde les champs existants
          ...data.profile, // Écrase avec les nouveaux champs de la réponse
          specialty: Array.isArray(data.profile.specialties) ? data.profile.specialties.join(', ') : '',
          coverImage: data.profile.coverImage || '',
          region: data.profile.region || '',
          bio: data.profile.bio || '',
          // Toujours stocker la photo de profil à la racine
          profileImage: data.profile.user?.profileImage || data.profile.profileImage || '',
          // Mise à jour des réseaux sociaux depuis la réponse (priorité à artist.socialLinks)
          socialLinks: data.profile.socialLinks || data.profile.user?.socialLinks || {},
          // Mise à jour du nom utilisateur si modifié
          user: {
            ...artist.user,
            name: data.profile.name || data.profile.user?.name || artist.user?.name,
            profileImage: data.profile.user?.profileImage || data.profile.profileImage || artist.user?.profileImage,
            socialLinks: data.profile.socialLinks || data.profile.user?.socialLinks || {},
          }
        })
        setEditModalOpen(false)
      }
    } catch {}
    setEditLoading(false)
  }
  // Fonction pour soumettre une nouvelle affiche
  const handleSubmitPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoster.imageUrl || !newPoster.description.trim()) return;
    
    setPosterLoading(true);
    try {
      const res = await fetch('/api/poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newPoster.imageUrl,
          description: newPoster.description,
          // Pas besoin d'artistId car l'API utilise l'artiste connecté
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosters(prev => [data.poster, ...prev]); // Ajoute la nouvelle affiche en début de liste
        setNewPoster({ imageUrl: "", description: "" });
        setShowPosterModal(false);
      } else {
        const error = await res.json();
        console.error('Erreur API:', error);
        alert('Erreur lors de la création de l\'affiche: ' + (error.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'affiche:', error);
      alert('Erreur lors de la création de l\'affiche');
    }
    setPosterLoading(false);
  };

  if (loading) return <div className="text-center text-amber-400 py-12">Chargement...</div>;
  if (!artist) return <div className="text-center text-red-400 py-12">Comédien non trouvé.</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24 md:pt-32">
      {/* Bouton retour au dashboard (si propriétaire) */}
      {isOwner && (
        <div className="fixed top-4 right-4 z-50">
          <a
            href="/dashboard-artiste"
            className="bg-black/80 hover:bg-black text-amber-400 hover:text-amber-300 font-semibold px-4 py-2 rounded-lg shadow-lg border border-amber-400/50 hover:border-amber-400 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>
        </div>
      )}

      {/* Header visuel artiste */}
      <div className="relative w-full h-96 md:h-[32rem] flex items-end justify-center bg-gradient-to-t from-black/90 via-[#2d0b18]/80 to-transparent">
        {artist.coverImage ? (
          <img src={artist.coverImage} alt="Bannière du comédien" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-900 opacity-40" />
        )}
        <div className="relative z-10 flex flex-col items-center mb-[-2rem] md:mb-[-3rem] w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-400 shadow-lg bg-black flex items-center justify-center overflow-hidden mx-auto mt-2 md:mt-0">
            {artist.profileImage ? (
              <img src={artist.profileImage} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-amber-400 mt-2 md:mt-4 text-center drop-shadow-lg">{artist.name || artist.user?.name}</h1>
          {/* Bouton Modifier (affiché si propriétaire) */}
          {isOwner && !editModalOpen && (
            <button
              onClick={handleOpenEdit}
              className="mt-4 bg-amber-400/90 text-black font-bold px-4 py-2 rounded-lg shadow-lg hover:bg-amber-500 border-2 border-white/80 ring-4 ring-black/30 transition-colors z-50"
              style={{ pointerEvents: 'auto' }}
            >
              <Pencil className="w-5 h-5 inline-block mr-2" /> Modifier le profil
            </button>
          )}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {artist.specialty && <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">{artist.specialty}</span>}
            {artist.region && <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">{artist.region}</span>}
          </div>
          {/* Réseaux sociaux */}
          <div className="flex gap-4 mt-4">
            {artist.socialLinks?.facebook && <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Facebook className="w-6 h-6" /></a>}
            {artist.socialLinks?.instagram && <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Instagram className="w-6 h-6" /></a>}
            {artist.socialLinks?.youtube && <a href={artist.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Youtube className="w-6 h-6" /></a>}
            {artist.socialLinks?.website && <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Globe className="w-6 h-6" /></a>}
          </div>
        </div>
        {/* Bouton ami bi-directionnel */}
        <FriendButton artistId={artist?.artistProfile?.id} theaterId={artist?.theaterProfile?.id} isOwner={isOwner} />
      </div>
      {/* Section d'édition (bannière, photo, réseaux) affichée uniquement en mode édition */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-[#2d0b18] via-[#3a1c4d] to-black border border-amber-400/40 shadow-2xl rounded-2xl w-full max-w-2xl relative my-8">
            {/* Header avec titre et bouton fermer */}
            <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
              <h2 className="text-2xl font-bold text-amber-400">Éditer le profil</h2>
              <button
                className="text-gray-400 hover:text-amber-400 transition-colors"
                onClick={() => setEditModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulaire scrollable */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="Votre nom complet"
                      value={editProfile?.name || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Spécialité</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="Stand-up, Improvisation..."
                      value={editProfile?.specialty || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, specialty: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Région</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                    placeholder="Paris, Lyon, Marseille..."
                    value={editProfile?.region || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, region: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biographie</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Parlez-nous de votre parcours..."
                    value={editProfile?.bio || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Photo de profil</label>
                    <MediaUploader
                      onUploadSuccess={(url) => {
                        setEditProfile((p: any) => ({ ...p, profileImage: url }));
                      }}
                      accept="image/*"
                      multiple={false}
                    />
                    {editProfile?.profileImage && (
                      <img src={editProfile.profileImage} alt="Profil" className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Bannière</label>
                    <MediaUploader
                      onUploadSuccess={(url) => {
                        setEditProfile((p: any) => ({ ...p, coverImage: url }));
                      }}
                      accept="image/*"
                      multiple={false}
                    />
                    {editProfile?.coverImage && (
                      <img src={editProfile.coverImage} alt="Bannière" className="w-full h-24 object-cover rounded-lg border-2 border-amber-400 mt-2" />
                    )}
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Réseaux sociaux
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
                      <Facebook className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="Facebook"
                      value={editProfile?.socialLinks?.facebook || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, facebook: e.target.value } }))}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
                      <Instagram className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="Instagram"
                      value={editProfile?.socialLinks?.instagram || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
                      <Youtube className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="YouTube"
                      value={editProfile?.socialLinks?.youtube || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
                      <Globe className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-900/50 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                      placeholder="Site web"
                      value={editProfile?.socialLinks?.website || ""}
                      onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, website: e.target.value } }))}
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Footer avec boutons d'action */}
            <div className="p-6 border-t border-amber-400/20 bg-black/30 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Description & À propos */}
      <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 space-y-12">
        <div className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-8 border border-amber-400/20">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-300 mb-2">Description</h2>
            <p className="text-gray-200 whitespace-pre-line text-lg">{artist.bio || 'Aucune description.'}</p>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-300 mb-2">À propos de l'artiste</h2>
            <p className="text-gray-200 whitespace-pre-line text-lg">{artist.history || 'Aucune histoire renseignée.'}</p>
          </div>
        </div>
        {/* Ajout d'affiche pour le propriétaire */}
        {isOwner && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Ajouter une affiche</h2>
            <button onClick={() => setShowPosterModal(true)} className="bg-amber-400 text-black px-6 py-2 rounded-full font-bold shadow hover:bg-amber-500 transition mb-4">Nouvelle affiche</button>
          </div>
        )}
        {/* Galerie d'affiches */}
        {posters && posters.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-amber-400">Affiches de l'artiste</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {posters.map((poster: any, idx: number) => (
                <div key={poster.id} className="relative group overflow-hidden rounded-xl shadow-lg border border-amber-400/30 cursor-pointer" onClick={() => handleOpenPoster(poster.id)}>
                  {(poster.imageUrl || poster.url) ? (
                    <img src={poster.imageUrl || poster.url} alt={`Affiche ${idx + 1}`} className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center bg-gray-800 text-gray-400">Aucune image</div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-lg">Agrandir</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center text-gray-400 mt-8">Aucune affiche pour cet artiste.</div>
        )}
      </div>
      {/* MODALE POUR UPLOAD AFFICHE */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-8 w-full max-w-lg border border-amber-400/30 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-amber-400" onClick={() => setShowPosterModal(false)}><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Ajouter une nouvelle affiche</h2>            <MediaUploader
              onUploadSuccess={(url) => {
                setNewPoster(prev => ({ ...prev, imageUrl: url }));
              }}
              accept="image/*"
              multiple={false}
            />
            {newPoster.imageUrl && (
              <img src={newPoster.imageUrl} alt="Aperçu" className="w-full h-32 object-cover rounded-lg border-2 border-amber-400 mt-2" />
            )}
            <form onSubmit={handleSubmitPoster} className="mt-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-300">Description de l'affiche</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Description"
                    value={newPoster.description}
                    onChange={e => setNewPoster(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" disabled={posterLoading} className="mt-4 w-full bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded-lg transition-colors">
                {posterLoading ? "Ajout en cours..." : "Ajouter l'affiche"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* MODALE POUR AFFICHER UNE AFFICHE EN GRAND + DESCRIPTION + COMMENTAIRES + LIKE */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-xl p-8 w-full max-w-lg border border-amber-400/30 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-amber-400" onClick={() => setSelectedPoster(null)}><X className="w-6 h-6" /></button>
            <img src={selectedPoster.imageUrl || "/default-poster.png"} alt="Affiche" className="w-full h-64 object-cover rounded-lg mb-4 border border-amber-400/20" />
            <div className="text-white font-semibold mb-2">{selectedPoster.description}</div>
            <div className="flex items-center gap-4 text-amber-400 mb-4">
              <button onClick={handleLike} disabled={likeLoading} className="flex items-center gap-1 hover:text-pink-400">
                <Heart className="w-5 h-5" /> {likes.length}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5" /> {comments.length}
              </span>
            </div>
            {/* Commentaires */}
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1">Commentaires :</div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {comments.map((c: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <img
                      src={c.user?.profileImage || "/default-avatar.png"}
                      alt={c.user?.name}
                      className="w-6 h-6 rounded-full object-cover border border-amber-400/20"
                    />
                    <span className="text-amber-300 font-medium">{c.user?.name}</span>
                    <span className="text-gray-300">{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Ajout commentaire */}
            <form onSubmit={handleAddComment} className="flex gap-2 mt-4">
              <input
                ref={commentInputRef}
                type="text"
                className="flex-1 px-3 py-2 rounded bg-gray-800 border border-amber-400/20 text-white"
                placeholder="Ajouter un commentaire..."
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <button type="submit" className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded-lg transition-colors">Envoyer</button>
            </form>          </div>
        </div>
      )}

      {/* GALERIE D'AFFICHES */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {posters && posters.length > 0 ? (
          <section>
            <h2 className="text-3xl font-bold mb-6 text-amber-400 text-center">Affiches de l'artiste ({posters.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {posters.map((poster: any, idx: number) => {
                console.log('Poster à afficher:', poster);
                return (
                  <div 
                    key={poster.id || idx} 
                    className="relative group overflow-hidden rounded-xl shadow-lg border border-amber-400/30 cursor-pointer hover:shadow-xl transition-all duration-300" 
                    onClick={() => handleOpenPoster(poster.id)}
                  >
                    {(poster.imageUrl || poster.url) ? (
                      <img 
                        src={poster.imageUrl || poster.url} 
                        alt={poster.description || `Affiche ${idx + 1}`} 
                        className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-gray-800 text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎭</div>
                          <div>Aucune image</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-amber-400 font-bold text-lg">Voir l'affiche</span>
                    </div>
                    {poster.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                        {poster.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center text-gray-400 py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2">Aucune affiche disponible</h3>
            <p className="text-gray-500">
              {posters ? 
                `Cet artiste n'a pas encore publié d'affiches. (${posters.length} affiches chargées)` : 
                'Chargement des affiches en cours...'
              }
            </p>
          </div>
        )}
      </div>
    </main>
  )
}