import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

// Version simplifiée utilisant EmailJS côté client
// POST: Créer un token et renvoyer les infos pour que le client envoie l'email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email déjà vérifié" }, { status: 400 });
    }

    // Supprimer les anciens tokens de vérification
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: email.toLowerCase(),
        type: "EMAIL_VERIFICATION"
      }
    });

    // Créer un nouveau token de vérification
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
        type: "EMAIL_VERIFICATION"
      }
    });

    // Retourner les informations pour que le client puisse envoyer l'email
    return NextResponse.json({ 
      message: "Token créé avec succès",
      emailData: {
        userEmail: email,
        userName: user.name || 'Utilisateur',
        verificationToken: token
      }
    });

  } catch (error) {
    console.error("Erreur création token:", error);
    return NextResponse.json({ 
      error: "Erreur serveur" 
    }, { status: 500 });
  }
}

// GET: Vérifier le token d'email (reste identique)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Token requis" }, { status: 400 });
    }

    // Trouver le token de vérification
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { 
        token,
        type: "EMAIL_VERIFICATION",
        expires: { gt: new Date() }
      }
    });

    if (!verificationToken) {
      return NextResponse.json({ 
        error: "Token invalide ou expiré" 
      }, { status: 400 });
    }

    // Mettre à jour l'utilisateur comme vérifié
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { 
        emailVerified: new Date(),
        updatedAt: new Date()
      }
    });

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Rediriger vers une page de succès
    return NextResponse.redirect(
      new URL('/email-verification?verified=true', request.url)
    );

  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.redirect(
      new URL('/email-verification?error=verification_failed', request.url)
    );
  }
}
