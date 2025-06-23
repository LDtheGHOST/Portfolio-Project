"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import MediaUploader from '@/components/ui/MediaUploader';
import { addTheaterPoster, removeTheaterPoster } from '@/app/actions/theater-actions';
import { User, MapPin, Users, Star, Facebook, Instagram, Globe, Youtube, Link as LinkIcon, Pencil, X, MessageCircle, Heart } from "lucide-react";
import FriendButton from '@/components/FriendButton';

export default function TheatreDetail() {
  const params = useParams();
  // @ts-ignore
  const id = typeof params === 'object' && params.id ? params.id : Array.isArray(params) ? params[0] : '';
  const [theatre, setTheatre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [banner, setBanner] = useState<string>("");
  const [socials, setSocials] = useState<any>({ facebook: "", instagram: "", youtube: "", website: "" });
  const [editMode, setEditMode] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterDesc, setPosterDesc] = useState("");
  const posterInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!id) return;
    const fetchTheatre = async () => {
      try {
        const res = await fetch(`/api/theatres/${id}`);
        if (!res.ok) return setTheatre(null);
        const data = await res.json();
        setTheatre(data);
        setBanner(data.coverImage || "");
        setSocials(data.socialLinks || { facebook: "", instagram: "", youtube: "", website: "" });
        // Vérifie si l'utilisateur connecté est le propriétaire
        if (session?.user?.email && data.email && session.user.email === data.email) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (e) {
        setTheatre(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTheatre();
  }, [id, session]);

  const handleMediaUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await addTheaterPoster(data.url);
        setTheatre((prev: any) => ({
          ...prev,
          galleryImages: prev.galleryImages ? [...prev.galleryImages, data.url] : [data.url],
        }));
      }
    }
  };

  const handleBannerUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      // PATCH vers une API à créer pour mettre à jour la bannière
      await fetch(`/api/theater/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: data.url }),
      });
      setBanner(data.url);
    }
  };

  // Fonction d'upload de la photo de profil
  const handleProfileImageUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("file", files[0]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      // PATCH vers l'API pour mettre à jour la photo de profil
      await fetch(`/api/theater/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: data.url }),
      });
      setTheatre((prev: any) => ({ ...prev, profileImage: data.url }));
    }
  };

  const handleSocialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocials({ ...socials, [e.target.name]: e.target.value });
  };

  const handleSaveSocials = async () => {
    await fetch(`/api/theater/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialLinks: socials }),
    });
  };

  // Ajout d'une affiche via l'API (POST /api/poster)
  const handlePosterUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterFile) return;
    const formData = new FormData();
    formData.append("file", posterFile);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      // Ajoute l'affiche avec description via l'API
      const posterRes = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theaterId: id,
          imageUrl: data.url,
          description: posterDesc,
        }),
      });
      const posterData = await posterRes.json();
      console.log("Réponse POST /api/poster:", posterRes.status, posterData);
      if (!posterRes.ok) {
        alert("Erreur lors de la création de l'affiche: " + (posterData?.error || posterRes.status));
        return;
      }
      setShowPosterModal(false);
      setPosterFile(null);
      setPosterDesc("");
      if (posterInputRef.current) posterInputRef.current.value = "";
      // Rafraîchir la liste des affiches
      try {
        const postersRes = await fetch(`/api/poster?theaterId=${id}`);
        if (postersRes.ok) {
          const postersData = await postersRes.json();
          setPosters(postersData.posters || []);
          console.log("Affiches récupérées après upload:", postersData);
        }
      } catch {}
    }
  };

  // MODALE POUR VOIR UNE AFFICHE EN GRAND + DESCRIPTION + COMMENTAIRES + LIKE
  const [selectedPoster, setSelectedPoster] = useState<{ url: string, desc?: string, id?: string, likes?: string[], comments?: any[] } | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [posters, setPosters] = useState<any[]>([]);

  // Charger les affiches du théâtre via l'API
  useEffect(() => {
    if (!id) return;
    const fetchPosters = async () => {
      try {
        const res = await fetch(`/api/poster?theaterId=${id}`);
        if (!res.ok) {
          setPosters([]);
          console.error("Erreur API /api/poster:", res.status);
          return;
        }
        const data = await res.json();
        setPosters(data.posters || []);
        console.log("Affiches récupérées:", data);
      } catch (e) {
        setPosters([]);
        console.error("Erreur réseau /api/poster:", e);
      }
    };
    fetchPosters();
  }, [id]);

  // Lorsqu'on ouvre une affiche, charger dynamiquement description, likes, commentaires
  const handleOpenPoster = async (posterId: string) => {
    try {
      const res = await fetch(`/api/poster?id=${posterId}`);
      if (!res.ok) return;
      const data = await res.json();
      // Correction : supporte id ou _id
      const realId = data.id || data._id || posterId;
      setSelectedPoster({
        id: realId,
        url: data.imageUrl,
        desc: data.description,
        likes: data.likes || [],
        comments: data.comments || [],
      });
      setLikes(data.likes || []);
      setComments(data.comments || []);
    } catch (e) {}
  };

  // Like instantané (optimiste)
  const handleLike = async () => {
    if (!selectedPoster?.id || !session?.user?.id) {
      console.error("handleLike: posterId ou userId manquant", selectedPoster?.id, session?.user?.id);
      return;
    }
    setLikeLoading(true);
    const alreadyLiked = likes.includes(session.user.id);
    // Optimistic update
    setLikes(prev => alreadyLiked ? prev.filter(id => id !== session.user.id) : [...prev, session.user.id]);
    setSelectedPoster(prev => prev ? {
      ...prev,
      likes: alreadyLiked ? prev.likes?.filter(id => id !== session.user.id) : [...(prev.likes || []), session.user.id]
    } : prev);
    try {
      const body = JSON.stringify({ posterId: selectedPoster.id });
      const res = await fetch(`/api/poster-like`, {
        method: alreadyLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        // Rollback if error
        setLikes(prev => alreadyLiked ? [...prev, session.user.id] : prev.filter(id => id !== session.user.id));
        setSelectedPoster(prev => prev ? {
          ...prev,
          likes: alreadyLiked ? [...(prev.likes || []), session.user.id] : (prev.likes || []).filter(id => id !== session.user.id)
        } : prev);
        const err = await res.json().catch(() => ({}));
        alert("Erreur like: " + (err?.error || res.status));
      }
    } catch (e) {
      // Rollback if error
      setLikes(prev => alreadyLiked ? [...prev, session.user.id] : prev.filter(id => id !== session.user.id));
      setSelectedPoster(prev => prev ? {
        ...prev,
        likes: alreadyLiked ? [...(prev.likes || []), session.user.id] : (prev.likes || []).filter(id => id !== session.user.id)
      } : prev);
      console.error("Erreur réseau like:", e);
    }
    setLikeLoading(false);
  };

  // Ajouter un commentaire réel via API (optimiste)
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Le commentaire est vide.");
      return;
    }
    if (!session?.user) {
      alert("Utilisateur non connecté.");
      return;
    }
    if (!selectedPoster?.id) {
      alert("ID d'affiche manquant pour le commentaire.");
      return;
    }
    // Optimistic update
    const optimisticComment = {
      user: {
        name: session.user.name || "Utilisateur",
        profileImage: session.user.image || null
      },
      text: comment,
      date: new Date().toLocaleString()
    };
    setComments(prev => [...prev, optimisticComment]);
    setSelectedPoster(prev => prev ? {
      ...prev,
      comments: [...(prev.comments || []), optimisticComment]
    } : prev);
    setComment("");
    try {
      const body = JSON.stringify({ posterId: selectedPoster.id, text: comment });
      const res = await fetch(`/api/poster-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        // Rollback if error
        setComments(prev => prev.filter(c => c !== optimisticComment));
        setSelectedPoster(prev => prev ? {
          ...prev,
          comments: (prev.comments || []).filter(c => c !== optimisticComment)
        } : prev);
        const err = await res.json().catch(() => ({}));
        alert("Erreur commentaire: " + (err?.error || res.status));
      } else {
        // Optionnel: remplacer l'optimiste par la vraie réponse
        const newComment = await res.json();
        setComments(prev => prev.map(c => c === optimisticComment ? newComment : c));
        setSelectedPoster(prev => prev ? {
          ...prev,
          comments: (prev.comments || []).map(c => c === optimisticComment ? newComment : c)
        } : prev);
      }
    } catch (e) {
      // Rollback if error
      setComments(prev => prev.filter(c => c !== optimisticComment));
      setSelectedPoster(prev => prev ? {
        ...prev,
        comments: (prev.comments || []).filter(c => c !== optimisticComment)
      } : prev);
      console.error("Erreur réseau commentaire:", e);
    }
  };

  // Suppression d'une affiche via l'API
  const handleDeletePoster = async (posterId: string) => {
    if (!posterId) {
      alert("ID d'affiche manquant pour suppression");
      return;
    }
    if (!window.confirm("Supprimer cette affiche ?")) return;
    try {
      const body = JSON.stringify({ posterId });
      console.log("DELETE POSTER body:", body);
      const res = await fetch(`/api/poster`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) {
        setSelectedPoster(null);
        setPosters(posters.filter(p => p.id !== posterId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur lors de la suppression de l'affiche: " + (err?.error || res.status));
      }
    } catch (e) {
      alert("Erreur réseau lors de la suppression.");
      console.error("Erreur réseau suppression:", e);
    }
  };

  if (loading) return <div className="text-center text-amber-400 py-12">Chargement...</div>;
  if (!theatre) return <div className="text-center text-red-400 py-12">Théâtre non trouvé.</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#2d0b18] to-[#3a1c4d] text-white pt-24 md:pt-32">
      {/* Header visuel du théâtre */}
      <div className="relative w-full h-96 md:h-[32rem] flex items-end justify-center bg-gradient-to-t from-black/90 via-[#2d0b18]/80 to-transparent">
        {banner ? (
          <img src={banner} alt="Bannière du théâtre" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-900 opacity-40" />
        )}
        <div className="relative z-10 flex flex-col items-center mb-[-2rem] md:mb-[-3rem] w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-400 shadow-lg bg-black flex items-center justify-center overflow-hidden mx-auto mt-2 md:mt-0">
            {theatre.coverImage || theatre.profileImage ? (
              <img src={theatre.coverImage || theatre.profileImage} alt="Photo de profil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 md:w-16 md:h-16 text-gray-500" />
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-amber-400 mt-2 md:mt-4 text-center drop-shadow-lg">{theatre.theaterName || theatre.name}</h1>
          {/* Bouton Modifier */}
          {isOwner && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-8 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 hover:from-amber-500 hover:to-yellow-400 transition-all duration-200 text-lg border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/50"
            >
              <Pencil className="w-6 h-6" />
              Modifier la page
            </button>
          )}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold"><MapPin className="w-4 h-4" /> {theatre.city} ({theatre.address})</span>
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold"><Users className="w-4 h-4" /> {theatre.capacity || 'Non spécifiée'} places</span>
            {theatre.averageRating && <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold"><Star className="w-4 h-4" /> {theatre.averageRating.toFixed(1)} / 5</span>}
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-sm font-semibold">{theatre.theaterType || 'Type inconnu'}</span>
          </div>
          {/* Réseaux sociaux et site */}
          <div className="flex gap-4 mt-4">
            {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Facebook className="w-6 h-6" /></a>}
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Instagram className="w-6 h-6" /></a>}
            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Youtube className="w-6 h-6" /></a>}
            {socials.website && <a href={socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400"><Globe className="w-6 h-6" /></a>}
          </div>
        </div>
        {/* Bouton ami pour ARTISTE visitant un théâtre */}
        <FriendButton theaterId={id} isOwner={isOwner} />
      </div>
      {/* Section d'édition (bannière, photo, réseaux) affichée uniquement en mode édition */}
      {isOwner && editMode && (
        <div className="max-w-2xl mx-auto mt-10 bg-gradient-to-br from-black/30 via-[#2d0b18]/60 to-[#3a1c4d]/60 rounded-3xl p-0 border border-amber-400/20 shadow-2xl overflow-hidden animate-fade-in backdrop-blur-md">
          {/* Header de la modale */}
          <div className="flex justify-between items-center px-8 py-6 bg-black/30 border-b border-amber-400/10">
            <h2 className="text-2xl font-extrabold text-amber-300 tracking-wide flex items-center gap-2">
              <span className="inline-block bg-amber-400/20 rounded-full px-3 py-1 text-amber-500 text-lg">🎨</span>
              Personnaliser la page
            </h2>
            <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-white font-bold text-lg transition-colors">Fermer</button>
          </div>
          {/* Contenu de la modale */}
          <div className="flex flex-col gap-8 px-8 py-8">
            <div>
              <span className="block text-base text-amber-200 mb-2 font-semibold">Bannière (fond en haut)</span>
              <MediaUploader onUpload={handleBannerUpload} accept="image/*" multiple={false} />
            </div>
            <div>
              <span className="block text-base text-amber-200 mb-2 font-semibold">Photo de profil</span>
              <MediaUploader onUpload={handleProfileImageUpload} accept="image/*" multiple={false} />
            </div>
            <form className="flex flex-col gap-4 mt-2" onSubmit={e => { e.preventDefault(); handleSaveSocials(); }}>
              <span className="block text-base text-amber-200 mb-2 font-semibold">Réseaux sociaux & site</span>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-black/30 border border-amber-400/20 rounded-full px-3 py-2 shadow-sm">
                  <Facebook className="w-5 h-5 text-blue-400" />
                  <input type="url" name="facebook" value={socials.facebook} onChange={handleSocialsChange} placeholder="Facebook" className="bg-transparent outline-none text-white w-32 placeholder:text-gray-400" />
                </div>
                <div className="flex items-center gap-2 bg-black/30 border border-amber-400/20 rounded-full px-3 py-2 shadow-sm">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <input type="url" name="instagram" value={socials.instagram} onChange={handleSocialsChange} placeholder="Instagram" className="bg-transparent outline-none text-white w-32 placeholder:text-gray-400" />
                </div>
                <div className="flex items-center gap-2 bg-black/30 border border-amber-400/20 rounded-full px-3 py-2 shadow-sm">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <input type="url" name="youtube" value={socials.youtube} onChange={handleSocialsChange} placeholder="YouTube" className="bg-transparent outline-none text-white w-32 placeholder:text-gray-400" />
                </div>
                <div className="flex items-center gap-2 bg-black/30 border border-amber-400/20 rounded-full px-3 py-2 shadow-sm">
                  <Globe className="w-5 h-5 text-amber-300" />
                  <input type="url" name="website" value={socials.website} onChange={handleSocialsChange} placeholder="Site web" className="bg-transparent outline-none text-white w-32 placeholder:text-gray-400" />
                </div>
              </div>
              <button type="submit" className="bg-gradient-to-r from-amber-400 to-amber-500 text-black px-8 py-2 rounded-full font-bold hover:from-amber-500 hover:to-yellow-400 transition self-start mt-4 shadow-lg text-base">Enregistrer</button>
            </form>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 space-y-12">
        {/* Description & À propos */}
        <div className="bg-white/10 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-8 border border-amber-400/20">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-300 mb-2">Description</h2>
            <p className="text-gray-200 whitespace-pre-line text-lg">{theatre.description || 'Aucune description.'}</p>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-300 mb-2">À propos du théâtre</h2>
            <p className="text-gray-200 whitespace-pre-line text-lg">{theatre.history || 'Aucune histoire renseignée.'}</p>
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
            <h2 className="text-2xl font-bold mb-4 text-amber-400">Affiches du théâtre</h2>
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
          <div className="text-center text-gray-400 mt-8">Aucune affiche pour ce théâtre.</div>
        )}
      </div>
      {/* MODALE POUR UPLOAD AFFICHE */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form onSubmit={handlePosterUpload} className="bg-gradient-to-br from-black/80 via-[#2d0b18]/80 to-[#3a1c4d]/80 rounded-2xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-6 border border-amber-400/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-amber-300">Ajouter une affiche</h3>
              <button type="button" onClick={() => { setShowPosterModal(false); setPosterFile(null); setPosterDesc(""); if (posterInputRef.current) posterInputRef.current.value = ""; }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={posterInputRef}
              onChange={e => setPosterFile(e.target.files?.[0] || null)}
              className="block w-full text-white bg-black/30 border border-amber-400/20 rounded-full px-4 py-2 mb-2"
              required
            />
            <textarea
              value={posterDesc}
              onChange={e => setPosterDesc(e.target.value)}
              placeholder="Description de l'affiche (optionnel)"
              className="w-full bg-black/30 border border-amber-400/20 rounded-xl px-4 py-2 text-white min-h-[80px]"
            />
            <div className="flex gap-4 justify-end mt-2">
              <button type="button" onClick={() => { setShowPosterModal(false); setPosterFile(null); setPosterDesc(""); if (posterInputRef.current) posterInputRef.current.value = ""; }} className="px-4 py-2 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700">Annuler</button>
              <button type="submit" className="px-6 py-2 rounded-full bg-amber-400 text-black font-bold hover:bg-amber-500 shadow">Uploader</button>
            </div>
          </form>
        </div>
      )}
      {/* MODALE POUR AFFICHER UNE AFFICHE EN GRAND + DESCRIPTION + COMMENTAIRES + LIKE */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div
            className={
              "relative w-full max-w-5xl h-[80vh] bg-black rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-amber-400/30" +
              " " +
              "md:h-[80vh] md:flex-row flex-col h-full"
            }
          >
            <button onClick={() => setSelectedPoster(null)} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/60 rounded-full p-2"><X className="w-7 h-7" /></button>
            {/* Image à gauche (ou en haut sur mobile) */}
            <div className="flex-1 bg-black flex items-center justify-center max-h-full md:max-h-full max-w-full md:border-r border-amber-400/20 md:rounded-l-2xl rounded-t-2xl md:rounded-t-none">
              {(selectedPoster.imageUrl || selectedPoster.url) ? (
                <img
                  src={selectedPoster.imageUrl || selectedPoster.url}
                  alt="Affiche"
                  className="object-contain max-h-[40vh] md:max-h-full max-w-full w-auto h-auto mx-auto"
                  style={{ maxHeight: '40vh', width: '100%', height: 'auto' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">Aucune image</div>
              )}
            </div>
            {/* Colonne droite : likes, description, commentaires (en dessous sur mobile) */}
            <div className="w-full md:w-[420px] flex flex-col h-full p-6 gap-4 bg-gradient-to-b from-black/90 via-[#2d0b18]/80 to-[#3a1c4d]/80 overflow-y-auto">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-amber-400 bg-black rounded-full p-1 border border-amber-400/30" />
                <span className="font-bold text-amber-300 text-lg truncate">{theatre?.theaterName || theatre?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    await handleLike();
                    // Re-fetch poster data for up-to-date likes/comments
                    if (selectedPoster?.id) {
                      const res = await fetch(`/api/poster?id=${selectedPoster.id}`);
                      if (res.ok) {
                        const data = await res.json();
                        setLikes(data.likes || []);
                        setComments(data.comments || []);
                        setSelectedPoster(prev => prev ? {
                          ...prev,
                          id: data.id || data._id || prev.id,
                          likes: data.likes,
                          comments: data.comments
                        } : prev);
                      }
                    }
                  }}
                  disabled={likeLoading || !session?.user?.id}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold transition text-lg ${session?.user?.id && likes.includes(session.user.id) ? "bg-amber-400 text-black" : "bg-black/30 text-amber-400 border border-amber-400/30"}`}
                >
                  <Heart className={`w-6 h-6 ${session?.user?.id && likes.includes(session.user.id) ? "fill-amber-400" : ""}`} />
                  <span>{likes.length}</span>
                </button>
                {isOwner && (
                  <button onClick={() => handleDeletePoster(selectedPoster.id!)} className="px-4 py-2 rounded-full bg-red-500 text-white font-bold hover:bg-red-600">Supprimer</button>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-300 mb-1 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Description</h4>
                <p className="text-white/90 bg-black/30 rounded-xl p-3 min-h-[40px] break-words text-base">{selectedPoster.desc || selectedPoster.description || "Aucune description."}</p>
              </div>
              <div className="flex-1 flex flex-col">
                <h4 className="text-base font-bold text-amber-300 mb-1 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Commentaires</h4>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    await handleAddComment(e);
                    // Re-fetch comments after adding
                    if (selectedPoster?.id) {
                      const res = await fetch(`/api/poster?id=${selectedPoster.id}`);
                      if (res.ok) {
                        const data = await res.json();
                        setComments(data.comments || []);
                        setSelectedPoster(prev => prev ? {
                          ...prev,
                          id: data.id || data._id || prev.id,
                          comments: data.comments
                        } : prev);
                      }
                    }
                  }}
                  className="flex gap-2 mb-2"
                >
                  <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Ajouter un commentaire..." className="flex-1 rounded-full px-4 py-2 bg-black/30 border border-amber-400/20 text-white" />
                  <button type="submit" className="bg-amber-400 text-black px-4 py-2 rounded-full font-bold hover:bg-amber-500" disabled={!session?.user}>Envoyer</button>
                </form>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-2">
                  {comments.length === 0 && <span className="text-gray-400">Aucun commentaire.</span>}
                  {comments.map((c, i) => (
                    <div key={i} className="bg-black/30 rounded-xl px-3 py-2 text-white text-sm flex items-center gap-3">
                      {c.user?.profileImage ? (
                        <img src={c.user.profileImage} alt={c.user.name} className="w-7 h-7 rounded-full object-cover border border-amber-400/30" />
                      ) : (
                        <User className="w-7 h-7 text-amber-400" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-amber-300">{c.user?.name || "Utilisateur"}</span>
                        <span>{c.text}</span>
                        <span className="text-xs text-gray-400 mt-1">{c.date ? c.date : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
