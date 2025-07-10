import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// API de debug pour tester la structure de la DB
export async function GET() {
  try {
    // Test 1: Compter les utilisateurs artistes
    const artistCount = await prisma.user.count({
      where: { role: "ARTIST" }
    });

    // Test 2: Récupérer quelques artistes avec leurs IDs
    const artists = await prisma.user.findMany({
      where: { role: "ARTIST" },
      select: {
        id: true,
        name: true,
        role: true,
        artistProfile: {
          select: {
            id: true
          }
        }
      },
      take: 5
    });

    // Test 3: Compter les profils d'artistes
    const artistProfileCount = await prisma.artistProfile.count();

    return NextResponse.json({
      artistCount,
      artistProfileCount,
      sampleArtists: artists,
      message: "Debug successful"
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json({ 
      error: "Erreur debug", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
