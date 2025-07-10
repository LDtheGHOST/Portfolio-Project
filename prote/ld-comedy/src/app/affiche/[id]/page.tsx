import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  MapPin, 
  User,
  Theater,
  Clock,
  Star
} from 'lucide-react'

interface PosterPageProps {
  params: {
    id: string
  }
}

async function getPoster(id: string) {
  try {
    const poster = await prisma.poster.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            artistProfile: {
              select: {
                stageName: true,
                bio: true,
                specialties: true,
                profileImage: true
              }
            },
            theaterProfile: {
              select: {
                theaterName: true,
                address: true,
                capacity: true,
                description: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                artistProfile: {
                  select: {
                    profileImage: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return poster
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'affiche:', error)
    return null
  }
}

export default async function PosterPage({ params }: PosterPageProps) {
  const poster = await getPoster(params.id)

  if (!poster) {
    notFound()
  }

  const isArtist = poster.user.role === 'ARTIST'
  const profileName = isArtist 
    ? poster.user.artistProfile?.stageName || poster.user.name
    : poster.user.theaterProfile?.theaterName || poster.user.name

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-red-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Bouton retour */}
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Image de l'affiche */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={poster.imageUrl}
                alt={poster.description || 'Affiche de spectacle'}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
              
              {/* Overlay avec actions */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors hover:scale-110">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors hover:scale-110">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Nombre de likes */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-white text-sm">{poster.likes?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-6">
            
            {/* Profil de l'artiste/théâtre */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/20">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-full flex items-center justify-center">
                  {isArtist ? (
                    <User className="w-8 h-8 text-red-950" />
                  ) : (
                    <Theater className="w-8 h-8 text-red-950" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{profileName}</h2>
                  <p className="text-amber-400">
                    {isArtist ? 'Artiste' : 'Théâtre'}
                  </p>
                </div>
              </div>

              {/* Informations spécifiques */}
              {isArtist && poster.user.artistProfile?.specialties && (
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span>{Array.isArray(poster.user.artistProfile.specialties) 
                    ? poster.user.artistProfile.specialties.join(', ') 
                    : poster.user.artistProfile.specialties}</span>
                </div>
              )}

              {!isArtist && poster.user.theaterProfile?.address && (
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>{poster.user.theaterProfile.address}</span>
                </div>
              )}

              {!isArtist && poster.user.theaterProfile?.capacity && (
                <div className="flex items-center space-x-2 text-gray-300 mb-2">
                  <Theater className="w-4 h-4 text-purple-400" />
                  <span>{poster.user.theaterProfile.capacity} places</span>
                </div>
              )}

              <div className="flex items-center space-x-2 text-gray-300 text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Publié le {new Date(poster.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            {/* Description */}
            {poster.description && (
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{poster.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href={`/contact/${poster.user.id}`}
                className="w-full bg-gradient-to-r from-amber-400 to-red-500 text-red-950 font-semibold py-3 px-6 rounded-xl hover:from-amber-500 hover:to-red-600 transition-all duration-300 text-center block hover:scale-105"
              >
                Contacter {isArtist ? 'l\'artiste' : 'le théâtre'}
              </Link>
              
              <button className="w-full bg-gradient-to-r from-purple-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-red-600 transition-all duration-300 hover:scale-105">
                Ajouter aux favoris
              </button>
            </div>
          </div>
        </div>

        {/* Section commentaires */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Commentaires ({poster.comments.length})</h3>
          
          {poster.comments.length > 0 ? (
            <div className="space-y-4">
              {poster.comments.map((comment) => (
                <div key={comment.id} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-600/20 hover:border-gray-500/30 transition-colors">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-red-950" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{comment.user.name}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 ml-11">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-600/20">
              <p className="text-gray-400">Aucun commentaire pour le moment.</p>
              <p className="text-gray-500 text-sm mt-2">Soyez le premier à commenter cette affiche !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
