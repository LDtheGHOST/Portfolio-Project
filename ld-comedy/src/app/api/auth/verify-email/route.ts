import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { EmailService } from "@/lib/email";

// POST: Demander un nouveau token de vérification
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

    // Envoyer l'email de vérification
    const emailResult = await EmailService.sendVerificationEmail(email, token);

    if (!emailResult.success) {
      return NextResponse.json({ 
        error: "Erreur lors de l'envoi de l'email" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Email de vérification envoyé avec succès" 
    });

  } catch (error) {
    console.error("Erreur envoi vérification:", error);
    return NextResponse.json({ 
      error: "Erreur serveur" 
    }, { status: 500 });
  }
}

// GET: Vérifier le token d'email
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

    // Envoyer l'email de bienvenue
    const userType = user.role === 'ARTIST' ? 'artist' : 'theater';
    await EmailService.sendWelcomeEmail(user.email, user.name || 'Utilisateur', userType);

    // Rediriger vers une page de succès
    return NextResponse.redirect(
      new URL('/connexion?verified=true', request.url)
    );

  } catch (error) {
    console.error("Erreur vérification email:", error);
    return NextResponse.redirect(
      new URL('/connexion?error=verification_failed', request.url)
    );
  }
}
