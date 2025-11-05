"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Mic,
  Camera,
  Save,
  ArrowLeft,
  Clock,
  Edit3,
  Eye,
} from "lucide-react"
import Link from "next/link"
import MediaUploader from '@/components/ui/MediaUploader';

export default function ProfileArtiste() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [artistProfileId, setArtistProfileId] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    nom: "",
    prenom: "",
    nomArtiste: "",
    email: "",
    telephone: "",
    dateNaissance: "",
    ville: "",
    codePostal: "",
    adresse: "",
    
    // Informations artistiques
    discipline: "",
    specialites: [],
    experience: "",
    biographie: "",
    disponibilite: "",
    
    // Médias
    photoProfile: "",
    
    // Préférences
    typesEvenements: [],
    rayonIntervention: "",
  })

  const disciplines = [
    "Stand-up",
    "Magie",
    "Musique",
    "Danse",
    "Théâtre",
    "Chant",
    "Improvisation",
    "Clown",
    "Ventriloquie",
    "Mime",
    "Autre"
  ]

  const typesEvenements = [
    "Anniversaire",
    "Mariage",
    "Entreprise",
    "Festival",
    "Bar/Restaurant",
    "Théâtre",
    "Événement privé",
    "Spectacle de rue",
    "École/Université",
    "Gala"
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/connexion")
    }
    loadProfileData()
  }, [status, router])

  const loadProfileData = async () => {
    try {
      const response = await fetch('/api/artist/profile');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        const profile = data.profile;

        // Récupérer l'ID du profil artiste
        if (profile?.id) {
          setArtistProfileId(profile.id);
        }

        setProfileData({
          // Informations personnelles depuis User
          nom: user?.name?.split(' ')[1] || "",
          prenom: user?.name?.split(' ')[0] || "",
          nomArtiste: profile?.stageName || "",
          email: user?.email || "",
          telephone: user?.phoneNumber || "",
          dateNaissance: "",
          ville: profile?.location || "",
          codePostal: "",
          adresse: user?.address || "",

          // Informations artistiques depuis ArtistProfile
          discipline: user?.specialty || "",
          specialites: profile?.specialties || [],
          experience: profile?.experience || "",
          biographie: profile?.bio || user?.description || "",
          disponibilite: profile?.isAvailable ? "Disponible" : "Non disponible",

          // Médias
          photoProfile: user?.profileImage || "",

          // Préférences
          typesEvenements: [],
          rayonIntervention: profile?.maxDistance?.toString() || "",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayChange = (field, value, isAdd = true) => {
    setProfileData(prev => ({
      ...prev,
      [field]: isAdd 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/artist/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Données User
          name: `${profileData.prenom} ${profileData.nom}`,
          profileImage: profileData.photoProfile,
          description: profileData.biographie,
          specialty: profileData.discipline,
          phoneNumber: profileData.telephone,
          address: profileData.adresse,

          // Données ArtistProfile
          stageName: profileData.nomArtiste,
          bio: profileData.biographie,
          specialties: profileData.specialites,
          experience: profileData.experience,
          location: profileData.ville,
          isAvailable: profileData.disponibilite === "Disponible",
          maxDistance: parseInt(profileData.rayonIntervention) || null,
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profil mis à jour:', data);
        setIsEditing(false);
        // Recharger les données pour afficher les changements
        await loadProfileData();
      } else {
        const error = await response.json();
        console.error('Erreur lors de la sauvegarde:', error);
        alert(error.error || 'Erreur lors de la sauvegarde du profil');
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert('Erreur lors de la communication avec le serveur');
    } finally {
      setIsSaving(false)
    }
  }

  const handleMediaUpload = (files: File[]) => {
    // Ici, vous pouvez envoyer les fichiers à une API ou les stocker dans le state
    // Exemple : uploadMedia(files)
    console.log('Fichiers uploadés:', files);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-400">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-auto">
      {/* Contenu principal avec marge pour la sidebar */}
      <div className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* En-tête */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-amber-400/20 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard-artiste"
                className="text-gray-400 hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-amber-400">Mon Histoire</h1>
                <p className="text-sm text-gray-400">Gérez vos informations personnelles</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Bouton Voir profil public */}
              {artistProfileId && !isEditing && (
                <Link
                  href={`/comediens/${artistProfileId}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voir profil public</span>
                  <span className="sm:hidden">Profil</span>
                </Link>
              )}

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Modifier</span>
                  <span className="sm:hidden">Éditer</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50 text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "..." : "Sauvegarder"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="p-4 space-y-6">
          {/* Photo de profil */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-amber-400/20">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-amber-400/20 flex items-center justify-center overflow-hidden">
                    {profileData.photoProfile ? (
                      <img src={profileData.photoProfile} alt="Photo de profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="w-full">
                    <MediaUploader
                      onUploadSuccess={(url) => {
                        setProfileData(prev => ({ ...prev, photoProfile: url }));
                      }}
                      accept="image/*"
                      multiple={false}
                    />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-xl font-bold text-white">
                  {profileData.nomArtiste || `${profileData.prenom} ${profileData.nom}` || "Nom d'artiste"}
                </h2>
                <p className="text-amber-400">{profileData.discipline || "Discipline artistique"}</p>
                <p className="text-gray-400 text-sm">
                  {profileData.ville && `${profileData.ville}${profileData.codePostal ? ` (${profileData.codePostal})` : ''}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-amber-400/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Informations personnelles</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Prénom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) => handleInputChange('prenom', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white">{profileData.prenom || "Non renseigné"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white">{profileData.nom || "Non renseigné"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom d'artiste</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.nomArtiste}
                      onChange={(e) => handleInputChange('nomArtiste', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profileData.nomArtiste || "Non renseigné"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.email || "Non renseigné"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Téléphone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.telephone || "Non renseigné"}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ville</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.ville}
                        onChange={(e) => handleInputChange('ville', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {profileData.ville || "Non renseigné"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Code postal</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.codePostal}
                        onChange={(e) => handleInputChange('codePostal', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      />
                    ) : (
                      <p className="text-white">{profileData.codePostal || "Non renseigné"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date de naissance</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileData.dateNaissance}
                      onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.dateNaissance || "Non renseigné"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations artistiques */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-amber-400/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Informations artistiques</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Discipline principale</label>
                  {isEditing ? (
                    <select
                      value={profileData.discipline}
                      onChange={(e) => handleInputChange('discipline', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="">Sélectionnez une discipline</option>
                      {disciplines.map(discipline => (
                        <option key={discipline} value={discipline}>{discipline}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white flex items-center">
                      <Mic className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.discipline || "Non renseigné"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Années d'expérience</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.experience ? `${profileData.experience} ans` : "Non renseigné"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Rayon d'intervention (km)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profileData.rayonIntervention}
                      onChange={(e) => handleInputChange('rayonIntervention', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                      placeholder="Ex: 50"
                    />
                  ) : (
                    <p className="text-white">
                      {profileData.rayonIntervention ? `${profileData.rayonIntervention} km` : "Non renseigné"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Types d'événements</label>
                  {isEditing ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {typesEvenements.map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileData.typesEvenements.includes(type)}
                            onChange={(e) => handleArrayChange('typesEvenements', type, e.target.checked)}
                            className="mr-2 text-amber-400 focus:ring-amber-400"
                          />
                          <span className="text-sm text-white">{type}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profileData.typesEvenements.length > 0 ? (
                        profileData.typesEvenements.map(type => (
                          <span key={type} className="px-2 py-1 bg-amber-400/20 text-amber-400 rounded-full text-xs">
                            {type}
                          </span>
                        ))
                      ) : (
                        <p className="text-white">Non renseigné</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Disponibilité</label>
                  {isEditing ? (
                    <select
                      value={profileData.disponibilite}
                      onChange={(e) => handleInputChange('disponibilite', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="">Sélectionnez votre disponibilité</option>
                      <option value="weekends">Week-ends uniquement</option>
                      <option value="soirees">Soirées uniquement</option>
                      <option value="flexible">Flexible</option>
                      <option value="sur-demande">Sur demande</option>
                    </select>
                  ) : (
                    <p className="text-white">{profileData.disponibilite || "Non renseigné"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Biographie */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-amber-400/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Biographie</h3>
            {isEditing ? (
              <textarea
                value={profileData.biographie}
                onChange={(e) => handleInputChange('biographie', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-400 focus:outline-none resize-none"
                placeholder="Présentez-vous et décrivez votre parcours artistique..."
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">
                {profileData.biographie || "Aucune biographie renseignée"}
              </p>
            )}
          </div>

          <div className="my-8">
            <h2 className="text-xl font-bold mb-2">Galerie média</h2>
            <MediaUploader onUpload={handleMediaUpload} />
            {/* Ici, vous pourrez afficher la galerie des médias uploadés */}
          </div>
        </main>
      </div>
    </div>
  )
}