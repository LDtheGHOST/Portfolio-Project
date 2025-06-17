import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Récupérer tous les comédiens
export async function GET() {
  try {
    const comedians = await prisma.comedian.findMany();
    return NextResponse.json(comedians);
  } catch (error) {
    console.error("Erreur lors de la récupération des comédiens:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des comédiens" },
      { status: 500 }
    );
  }
}

// POST: Créer un nouveau comédien
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const comedian = await prisma.comedian.create({
      data: {
        name: data.name,
        biography: data.biography,
        photoUrl: data.photoUrl,
        showIds: data.showIds || []
      }
    });
    
    return NextResponse.json(comedian, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du comédien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du comédien" },
      { status: 500 }
    );
  }
} 