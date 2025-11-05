'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📧 Un lien de réinitialisation a été envoyé à votre adresse email.');
        setIsSuccess(true);
      } else {
        setMessage(data.error || 'Une erreur est survenue');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion au serveur');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-red-950 relative overflow-hidden">
      {/* Effets de fond animés */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo et titre */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-2xl mb-6 shadow-2xl"
            >
              <svg className="w-8 h-8 text-red-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Mot de passe oublié ?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-amber-200"
            >
              Pas de problème ! Nous allons vous envoyer un lien de réinitialisation.
            </motion.p>
          </div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-amber-400/30 shadow-2xl"
          >
            {/* Message de retour */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl p-4 mb-6 backdrop-blur-sm ${
                  isSuccess 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-300' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-300'
                }`}
              >
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
              </motion.div>
            )}            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-amber-200 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-amber-400/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Bouton d'envoi */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-red-950 font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-950 mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-6">
                  Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation.
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/connexion" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 block text-center"
                  >
                    Retour à la connexion
                  </Link>                  <button
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
            )}

            {/* Liens de navigation */}
            <div className="mt-8 pt-6 border-t border-amber-400/20 text-center space-y-3">
              <Link 
                href="/connexion" 
                className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
              >
                ← Retour à la connexion
              </Link>
              
              <p className="text-gray-400 text-xs">
                Pas encore de compte ?{" "}
                <Link 
                  href="/register" 
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm">
              © 2025 LD Comedy - Plateforme de comédie
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
