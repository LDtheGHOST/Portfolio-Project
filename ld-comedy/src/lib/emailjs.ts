import emailjs from '@emailjs/browser';

export class EmailJSService {
  private static SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
  private static TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
  private static PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

  /**
   * Initialise EmailJS (à appeler une fois au démarrage de l'app)
   */
  static init() {
    emailjs.init(this.PUBLIC_KEY);
  }

  /**
   * Envoie un email de vérification via EmailJS
   */
  static async sendVerificationEmail(userEmail: string, userName: string, verificationToken: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'LD Comedy',
      from_email: 'ldcomedyparis@gmail.com',
      subject: '🎭 Vérifiez votre compte LD Comedy',
      message: `
Bonjour ${userName},

Bienvenue sur LD Comedy ! 🎭

Pour activer votre compte et commencer à explorer notre plateforme de comédie, veuillez cliquer sur le lien ci-dessous :

${verificationUrl}

Ce lien expire dans 24 heures pour votre sécurité.

Si vous n'avez pas créé de compte sur LD Comedy, ignorez cet email.

Cordialement,
L'équipe LD Comedy
Luis David Cuevas
      `,
      verification_url: verificationUrl
    };

    try {
      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );
      
      console.log('Email envoyé avec EmailJS:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur EmailJS:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoie un email de bienvenue
   */
  static async sendWelcomeEmail(userEmail: string, userName: string, userType: 'artist' | 'theater') {
    const dashboardUrl = userType === 'artist' 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard-artiste`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard-theatre`;

    const typeLabel = userType === 'artist' ? 'Artiste' : 'Théâtre';
    const emoji = userType === 'artist' ? '🎭' : '🏛️';

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'LD Comedy',
      from_email: 'ldcomedyparis@gmail.com',
      subject: `🎉 Bienvenue sur LD Comedy, ${userName} !`,
      message: `
Félicitations ${userName} ! ${emoji}

Votre compte ${typeLabel} a été activé avec succès ! Vous faites maintenant partie de la communauté LD Comedy.

Prochaines étapes :
${userType === 'artist' ? `
• Complétez votre profil artiste
• Publiez vos premières affiches de spectacles  
• Découvrez les théâtres partenaires
` : `
• Configurez votre profil de théâtre
• Découvrez les talents disponibles
• Commencez à programmer vos spectacles
`}

Accédez à votre dashboard : ${dashboardUrl}

Bienvenue dans l'aventure !

L'équipe LD Comedy
Luis David Cuevas
      `,
      dashboard_url: dashboardUrl
    };

    try {
      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur EmailJS:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      from_name: 'LD Comedy',
      from_email: 'ldcomedyparis@gmail.com',
      subject: '🔑 Réinitialisation de votre mot de passe LD Comedy',
      message: `
Bonjour ${userName},

Vous avez demandé à réinitialiser votre mot de passe sur LD Comedy.

Pour créer un nouveau mot de passe, cliquez sur le lien ci-dessous :
${resetUrl}

Ce lien expire dans 1 heure pour votre sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe LD Comedy
      `,
      reset_url: resetUrl
    };

    try {
      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur EmailJS:', error);
      return { success: false, error };
    }
  }
}
