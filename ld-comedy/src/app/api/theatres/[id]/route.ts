import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: { params: { id: string } }) {
  const { id } = await context.params; // Correction : on await params
  try {
    const theatre = await prisma.theaterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profileImage: true,
          }
        }
      }
    });
    if (!theatre) return NextResponse.json({ error: "Théâtre non trouvé" }, { status: 404 });
    return NextResponse.json({
      ...theatre,
      name: theatre.user?.name,
      email: theatre.user?.email,
      profileImage: theatre.user?.profileImage,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
