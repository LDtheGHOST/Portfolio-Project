// Ce fichier affiche le profil public d'un artiste/comédien (infos, galerie d'affiches, etc.)
// On utilise l'API /api/artist/[id] pour récupérer les données
"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import FriendButton from '@/components/FriendButton';
import MediaUploader from "@/components/ui/MediaUploader"
import { User, MapPin, Users, Star, Facebook, Instagram, Globe, Youtube, Pencil, X, MessageCircle, Heart } from "lucide-react";
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
  const [likeLoading, setLikeLoading] = useState(false)
  const [comment, setComment] = useState("")
  const commentInputRef = useRef<HTMLInputElement>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showPosterModal, setShowPosterModal] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/comedians/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else {
          setArtist({
            ...data,
            specialty: Array.isArray(data.specialties) ? data.specialties.join(', ') : data.specialty || '',
            coverImage: data.coverImage || '',
            region: data.region || '',
          })
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
      socialLinks: artist?.user?.socialLinks || {},
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
        bio: editProfile.bio,
        coverImage: editProfile.coverImage,
        profileImage: editProfile.profileImage,
        socialLinks: cleanSocialLinks,
        name: editProfile.name,
      }
      delete payload.specialty // On n'envoie pas specialty (string)
      const res = await fetch(`/api/artist/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setArtist({
          ...data.profile,
          specialty: Array.isArray(data.profile.specialties) ? data.profile.specialties.join(', ') : '',
          coverImage: data.profile.coverImage || '',
          region: data.profile.region || '',
        })
        setEditModalOpen(false)
      }
    } catch {}
    setEditLoading(false)
  }

  if (loading) return <div className="text-center text-amber-400 py-12">Chargement...</div>;
  if (!artist) return <div className="text-center text-red-400 py-12">Comédien non trouvé.</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24 md:pt-32">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gradient-to-br from-[#2d0b18] via-[#3a1c4d] to-black border border-amber-400/40 shadow-2xl rounded-3xl p-4 w-full max-w-xs relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-amber-400" onClick={() => setEditModalOpen(false)}><X className="w-6 h-6" /></button>
            <h2 className="text-lg font-bold text-amber-400 mb-2 text-center">Éditer le profil</h2>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Nom"
                value={editProfile?.name || ""}
                onChange={e => setEditProfile((p: any) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="text"
                className="w-full px-3 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Spécialité"
                value={editProfile?.specialty || ""}
                onChange={e => setEditProfile((p: any) => ({ ...p, specialty: e.target.value }))}
              />
              <input
                type="text"
                className="w-full px-3 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Région"
                value={editProfile?.region || ""}
                onChange={e => setEditProfile((p: any) => ({ ...p, region: e.target.value }))}
              />
              <textarea
                className="w-full px-3 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="Bio"
                value={editProfile?.bio || ""}
                onChange={e => setEditProfile((p: any) => ({ ...p, bio: e.target.value }))}
                rows={2}
              />
              {/* Réseaux sociaux avec icônes */}
              <div className="flex gap-2 justify-center">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"><Facebook className="w-4 h-4" /></span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-2 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Lien Facebook"
                    value={editProfile?.socialLinks?.facebook || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, facebook: e.target.value } }))}
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"><Instagram className="w-4 h-4" /></span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-2 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Lien Instagram"
                    value={editProfile?.socialLinks?.instagram || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"><Youtube className="w-4 h-4" /></span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-2 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Lien YouTube"
                    value={editProfile?.socialLinks?.youtube || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))}
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"><Globe className="w-4 h-4" /></span>
                  <input
                    type="text"
                    className="w-full pl-8 pr-2 py-2 rounded-2xl bg-gray-900 border border-amber-400/20 text-white focus:ring-2 focus:ring-amber-400 outline-none"
                    placeholder="Site web"
                    value={editProfile?.socialLinks?.website || ""}
                    onChange={e => setEditProfile((p: any) => ({ ...p, socialLinks: { ...p.socialLinks, website: e.target.value } }))}
                  />
                </div>
              </div>
              {/* Upload images (MediaUploader à brancher ici) */}
              <div className="space-y-1">
                <label className="text-xs text-gray-300">Photo de profil</label>
                <MediaUploader
                  onUpload={async (files) => {
                    if (files.length > 0) {
                      const formData = new FormData();
                      formData.append("file", files[0]);
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.url) setEditProfile((p: any) => ({ ...p, profileImage: data.url }));
                    }
                  }}
                  accept="image/*"
                  multiple={false}
                />
                {editProfile?.profileImage && (
                  <img src={editProfile.profileImage} alt="Profil" className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 mx-auto mt-1" />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-300">Bannière</label>
                <MediaUploader
                  onUpload={async (files) => {
                    if (files.length > 0) {
                      const formData = new FormData();
                      formData.append("file", files[0]);
                      const res = await fetch("/api/upload", { method: "POST", body: formData });
                      const data = await res.json();
                      if (data.url) setEditProfile((p: any) => ({ ...p, coverImage: data.url }));
                    }
                  }}
                  accept="image/*"
                  multiple={false}
                />
                {editProfile?.coverImage && (
                  <img src={editProfile.coverImage} alt="Bannière" className="w-full h-12 object-cover rounded-2xl border-2 border-amber-400 mx-auto mt-1" />
                )}
              </div>
              <button type="submit" disabled={editLoading} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded-2xl transition-colors mt-2">
                {editLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
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
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Ajouter une nouvelle affiche</h2>
            <MediaUploader
              onUpload={async (files) => {
                if (files.length > 0) {
                  const formData = new FormData();
                  formData.append("file", files[0]);
                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                  const data = await res.json();
                  if (data.url) {
                    // Ici, on peut aussi envoyer les données de l'affiche à l'API si besoin
                    setPosters(prev => [...prev, { id: Date.now(), imageUrl: data.url, description: "", likes: [], comments: [] }]);
                  }
                }
              }}
              accept="image/*"
              multiple={false}
            />
            <button className="mt-4 w-full bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 py-2 rounded-lg transition-colors">
              Ajouter l'affiche
            </button>
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
            </form>
          </div>
        </div>
      )}
    </main>
  )
}