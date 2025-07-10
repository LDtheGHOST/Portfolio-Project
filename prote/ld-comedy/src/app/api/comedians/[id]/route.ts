import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Vérifie si l'ID est valide
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de l'artiste invalide" },
        { status: 400 }
      )
    }

    // Récupère la session utilisateur
    const session = await getServerSession(authOptions);    // D'abord, essayons de trouver l'artistProfile par ID
    console.log("Recherche artistProfile pour ID:", id);
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            description: true,
            specialty: true,
            socialLinks: true,
            role: true
          }
        }
      }
    });
    console.log("ArtistProfile trouvé:", artistProfile ? "OUI" : "NON");
    
    // Si on ne trouve pas par ID artistProfile, essayons par userId
    let finalArtistProfile = artistProfile;
    if (!artistProfile) {
      console.log("Recherche artistProfile par userId:", id);
      finalArtistProfile = await prisma.artistProfile.findFirst({
        where: { userId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              description: true,
              specialty: true,
              socialLinks: true,
              role: true
            }
          }
        }
      });
      console.log("ArtistProfile trouvé par userId:", finalArtistProfile ? "OUI" : "NON");
    }    // Si aucun profil artiste trouvé, renvoyer une erreur
    if (!finalArtistProfile) {
      return NextResponse.json(
        { error: "Profil artiste non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les posters de l'artiste séparément pour éviter les conflits de relations
    console.log("Recherche des posters pour artistId:", finalArtistProfile.id);
    const artistPosters = await prisma.poster.findMany({
      where: { 
        artistId: finalArtistProfile.id 
      },
      include: {
        comments: { 
          include: { 
            user: { 
              select: { name: true, profileImage: true } 
            } 
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Posters trouvés:", artistPosters.length);    // Si pas trouvé par artistProfile, essayons de trouver par userId directement
    let comedian;
    if (finalArtistProfile) {
      comedian = {
        id: finalArtistProfile.user.id,
        name: finalArtistProfile.user.name,
        profileImage: finalArtistProfile.user.profileImage,
        description: finalArtistProfile.user.description,
        specialty: finalArtistProfile.user.specialty,
        socialLinks: finalArtistProfile.user.socialLinks,
        bio: finalArtistProfile.bio,
        coverImage: finalArtistProfile.coverImage,
        specialties: finalArtistProfile.specialties,
        region: finalArtistProfile.region,
        posters: artistPosters,
        isOwner: session?.user?.id === finalArtistProfile.user.id,
        user: { id: finalArtistProfile.user.id },
      };
    } else {
      // Fallback: chercher directement par User ID
      const user = await prisma.user.findFirst({
        where: {
          id: id,
          role: "ARTIST"
        },
        select: {
          id: true,
          name: true,
          profileImage: true,
          description: true,
          specialty: true,
          socialLinks: true,
          artistProfile: {
            select: {
              bio: true,
              coverImage: true,
              specialties: true,
              region: true
            }
          }
        }
      });

      if (user) {
        comedian = {
          ...user,
          bio: user.artistProfile?.bio || null,
          posters: artistPosters,
          coverImage: user.artistProfile?.coverImage || null,
          specialties: user.artistProfile?.specialties || [],
          region: user.artistProfile?.region || null,
          isOwner: session?.user?.id === user.id,
          user: { id: user.id },
        };
        // @ts-ignore
        delete comedian.artistProfile;
      }
    }

    if (!comedian) {
      return NextResponse.json(
        { error: "Comédien non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(comedian)  } catch (e) {
    console.error("Erreur API comedians:", e);
    const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
    return NextResponse.json({ error: "Erreur serveur", details: errorMessage }, { status: 500 })
  }
}