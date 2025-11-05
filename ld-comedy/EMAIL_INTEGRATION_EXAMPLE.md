// Exemple d'intégration dans une route d'inscription
import { EmailService } from '@/lib/email';
import { randomBytes } from 'crypto';

// Dans votre route d'inscription (/api/register/route.ts)
export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    // 1. Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
        emailVerified: null, // Non vérifié par défaut
      }
    });

    // 2. Créer un token de vérification
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
        type: "EMAIL_VERIFICATION"
      }
    });

    // 3. Envoyer l'email de vérification
    const emailResult = await EmailService.sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error);
      // Optionnel : vous pouvez quand même créer le compte
      // et permettre de renvoyer l'email plus tard
    }

    return NextResponse.json({ 
      message: "Compte créé avec succès. Vérifiez votre email pour l'activer.",
      userId: user.id 
    });

  } catch (error) {
    // Gestion d'erreur...
  }
}

// Exemple d'utilisation dans un composant React
const handleResendVerification = async (email: string) => {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (response.ok) {
      toast.success('Email de vérification envoyé !');
    } else {
      toast.error(data.error || 'Erreur lors de l\'envoi');
    }
  } catch (error) {
    toast.error('Erreur de connexion');
  }
};
