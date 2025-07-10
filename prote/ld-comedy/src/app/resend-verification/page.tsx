'use client';

import { useState, useEffect } from 'react';
import { EmailJSService } from '@/lib/emailjs';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialiser EmailJS au chargement de la page
  useEffect(() => {
    EmailJSService.init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // 1. Créer le token côté serveur
      const response = await fetch('/api/auth/verify-email-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.emailData) {
        // 2. Envoyer l'email via EmailJS côté client
        const emailResult = await EmailJSService.sendVerificationEmail(
          data.emailData.userEmail,
          data.emailData.userName,
          data.emailData.verificationToken
        );

        if (emailResult.success) {
          setMessage('Email de vérification envoyé avec succès !');
          setIsSuccess(true);
        } else {
          setMessage('Token créé mais erreur lors de l\'envoi de l\'email. Réessayez.');
          setIsSuccess(false);
        }
      } else {
        setMessage(data.error || 'Une erreur est survenue');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-red-950">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-amber-400/30">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Renvoyer l'email de vérification</h1>
          <p className="text-amber-200">
            Entrez votre adresse email pour recevoir un nouveau lien de vérification
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            isSuccess ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${isSuccess ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSuccess ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
              {message}
            </div>
          </div>
        )}

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-200 mb-2">
                Adresse email
              </label>
              <input
                type="email"                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/30 border border-amber-400/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-red-950 py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-950 mr-2"></div>
                  Envoi en cours...
                </div>
              ) : (
                'Renvoyer l\'email de vérification'
              )}
            </button>
          </form>
        )}

        {isSuccess && (
          <div className="text-center space-y-4">
            <p className="text-amber-200">
              Vérifiez votre boîte mail et cliquez sur le lien de vérification.
            </p>
            <div className="space-y-2">
              <a 
                href="/connexion" 
                className="w-full bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-red-950 py-3 px-4 rounded-xl font-semibold transition-all duration-200 block shadow-lg hover:shadow-xl"
              >
                Aller à la connexion
              </a>
              <button
                onClick={() => {
                  setMessage('');
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full border border-amber-400/20 text-amber-200 py-3 px-4 rounded-xl font-semibold hover:bg-amber-400/10 transition-all duration-200"
              >
                Renvoyer à une autre adresse
              </button>
            </div>
          </div>
        )}        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
