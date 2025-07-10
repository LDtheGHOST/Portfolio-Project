import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { EmailService } from "@/lib/email";

// POST: Demander un lien de réinitialisation de mot de passe
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
      // Pour la sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({ 
        message: "Si cet email existe, un lien de réinitialisation a été envoyé." 
      });
    }

    // Supprimer les anciens tokens de réinitialisation
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: email.toLowerCase(),
        type: "PASSWORD_RESET"
      }
    });

    // Créer un nouveau token de réinitialisation
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
        type: "PASSWORD_RESET"
      }
    });

    // Envoyer l'email de réinitialisation
    const emailResult = await EmailService.sendPasswordResetEmail(email, token);

    if (!emailResult.success) {
      console.error('Erreur envoi email reset:', emailResult.error);
      // On continue quand même pour ne pas révéler d'informations
    }

    return NextResponse.json({ 
      message: "Si cet email existe, un lien de réinitialisation a été envoyé." 
    });

  } catch (error) {
    console.error("Erreur reset password:", error);
    return NextResponse.json({ 
      error: "Erreur serveur" 
    }, { status: 500 });
  }
}
