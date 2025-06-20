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
    const data: any = {};
    if (body.coverImage) data.coverImage = body.coverImage;
    if (body.socialLinks) data.socialLinks = body.socialLinks;
    await prisma.theaterProfile.update({
      where: { userId: user.id },
      data,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur PATCH /api/theater/profile:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
