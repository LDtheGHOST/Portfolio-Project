import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: Récupérer un comédien par son ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const comedian = await prisma.comedian.findUnique({
      where: { id: params.id },
      include: { shows: true }
    });

    if (!comedian) {
      return NextResponse.json(
        { error: "Comédien non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(comedian);
  } catch (error) {
    console.error("Erreur lors de la récupération du comédien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du comédien" },
      { status: 500 }
    );
  }
}

// PUT: Mettre à jour un comédien
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const data = await request.json();
    
    const comedian = await prisma.comedian.update({
      where: { id: params.id },
      data: {
        name: data.name,
        biography: data.biography,
        photoUrl: data.photoUrl,
        showIds: data.showIds || []
      }
    });
    
    return NextResponse.json(comedian);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du comédien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du comédien" },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un comédien
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.comedian.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: "Comédien supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du comédien:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du comédien" },
      { status: 500 }
    );
  }
} 