import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { theaterProfile: true },
    });
    if (!user?.theaterProfile) {
      return NextResponse.json({ error: "Profil théâtre non trouvé" }, { status: 404 });
    }
    const body = await req.json();
    // Ajout log debug pour vérifier le body reçu
    console.log('[PATCH /api/theater/profile] Body reçu:', body);
    const theaterData: any = {};
    if (body.coverImage) theaterData.coverImage = body.coverImage;
    if (body.socialLinks) theaterData.socialLinks = body.socialLinks;
    // Met à jour la photo de profil sur User si profileImage présent
    if (body.profileImage) {
      await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: body.profileImage },
      });
    }
    if (Object.keys(theaterData).length > 0) {
      await prisma.theaterProfile.update({
        where: { userId: user.id },
        data: theaterData,
      });
    }
    // Refetch le profil à jour pour le frontend
    const updated = await prisma.theaterProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Erreur PATCH /api/theater/profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
