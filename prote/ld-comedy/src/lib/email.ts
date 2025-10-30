import { Resend } from 'resend';

// Initialiser Resend avec votre clé API
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export class EmailService {
  private static fromEmail = process.env.FROM_EMAIL || 'noreply@ldcomedy.com';

  /**
   * Envoie un email de vérification
   */
  static async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎭 LD Comedy</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Vérification de votre compte</p>
        </div>
        
        <div style="padding: 40px 20px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Bienvenue sur LD Comedy !</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Merci de vous être inscrit sur notre plateforme. Pour activer votre compte et commencer à explorer l'univers de la comédie, veuillez cliquer sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              ✅ Vérifier mon email
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; margin-top: 30px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
          
          <p style="color: #888; font-size: 14px; margin-top: 20px;">
            Ce lien expire dans 24 heures pour votre sécurité.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © 2025 LD Comedy - Plateforme de comédie by Luis David Cuevas
          </p>
        </div>
      </div>
    `;

    const text = `
      Bienvenue sur LD Comedy !
      
      Pour vérifier votre compte, visitez : ${verificationUrl}
      
      Ce lien expire dans 24 heures.
    `;

    return this.sendEmail({
      to: email,
      subject: '🎭 Vérifiez votre compte LD Comedy',
      html,
      text
    });
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎭 LD Comedy</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Réinitialisation de mot de passe</p>
        </div>
        
        <div style="padding: 40px 20px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Réinitialiser votre mot de passe</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              🔑 Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; margin-top: 30px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          
          <p style="color: #888; font-size: 14px;">
            Ce lien expire dans 1 heure pour votre sécurité.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © 2025 LD Comedy - Plateforme de comédie by Luis David Cuevas
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: '🔑 Réinitialisation de votre mot de passe LD Comedy',
      html,
      text: `Réinitialisez votre mot de passe : ${resetUrl}`
    });
  }

  /**
   * Envoie un email générique
   */
  static async sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
      });

      console.log('Email envoyé avec succès:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return { success: false, error };
    }
  }

  /**
   * Envoie un email de bienvenue après vérification
   */
  static async sendWelcomeEmail(email: string, name: string, userType: 'artist' | 'theater') {
    const dashboardUrl = userType === 'artist' 
      ? `${process.env.NEXTAUTH_URL}/dashboard-artiste`
      : `${process.env.NEXTAUTH_URL}/dashboard-theatre`;

    const typeLabel = userType === 'artist' ? 'Artiste' : 'Théâtre';
    const emoji = userType === 'artist' ? '🎭' : '🏛️';

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${emoji} LD Comedy</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Bienvenue dans la communauté !</p>
        </div>
        
        <div style="padding: 40px 20px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Félicitations ${name} ! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Votre compte ${typeLabel} a été activé avec succès ! Vous faites maintenant partie de la communauté LD Comedy.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Prochaines étapes :</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              ${userType === 'artist' ? `
                <li>Complétez votre profil artiste</li>
                <li>Publiez vos premières affiches de spectacles</li>
                <li>Découvrez les théâtres partenaires</li>
              ` : `
                <li>Configurez votre profil de théâtre</li>
                <li>Découvrez les talents disponibles</li>
                <li>Commencez à programmer vos spectacles</li>
              `}
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              🚀 Accéder à mon dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © 2025 LD Comedy - Plateforme de comédie by Luis David Cuevas
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `🎉 Bienvenue sur LD Comedy, ${name} !`,
      html,
      text: `Bienvenue ${name} ! Votre compte ${typeLabel} est maintenant actif. Accédez à votre dashboard : ${dashboardUrl}`
    });
  }
}
