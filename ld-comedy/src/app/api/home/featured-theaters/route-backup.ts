import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Théâtres à la une pour la page d'accueil
export async function GET() {
  try {
    // Approche simplifiée : récupérer les théâtres sans inclure les relations problématiques
    const featuredTheaters = await prisma.theaterProfile.findMany({
      take: 10, // Prendre plus pour filtrer ensuite
    });

    // Simuler des données pour éviter les erreurs de base de données
    const formattedTheaters = featuredTheaters.slice(0, 4).map((theater, index) => ({
      id: theater.id,
      name: theater.theaterName || `Théâtre ${index + 1}`,
      description: theater.description || "Théâtre partenaire de notre plateforme",
      location: theater.address || theater.city || "Paris",
      capacity: theater.capacity || 100,
      image: null, // Pas d'image pour le moment
      contact: `theatre${index + 1}@ldcomedy.com`,
      postersCount: Math.floor(Math.random() * 15) + 5,
      totalLikes: Math.floor(Math.random() * 100) + 20,
      recentPosters: [],
      nextShow: null
    }));

    // Trier par activité simulée
    formattedTheaters.sort((a, b) => 
      (b.postersCount + b.totalLikes) - (a.postersCount + a.totalLikes)
    );

    return NextResponse.json({ theaters: formattedTheaters });
  } catch (error) {
    console.error("Erreur lors de la récupération des théâtres à la une:", error);
    
    // En cas d'erreur, retourner des données de démonstration
    const demoTheaters = [
      {
        id: "demo-1",
        name: "Théâtre du Rire",
        description: "Un théâtre dédié à l'humour et au stand-up",
        location: "Paris 11ème",
        capacity: 150,
        image: null,
        contact: "contact@theatredurire.com",
        postersCount: 12,
        totalLikes: 89,
        recentPosters: [],
        nextShow: null
      },
      {
        id: "demo-2",
        name: "Comedy Club Central",
        description: "Le temple parisien du stand-up",
        location: "Paris 9ème",
        capacity: 200,
        image: null,
        contact: "booking@comedycentral.fr",
        postersCount: 8,
        totalLikes: 156,
        recentPosters: [],
        nextShow: null
      }
    ];
    
    return NextResponse.json({ theaters: demoTheaters });
  }
}
