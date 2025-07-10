'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerificationStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading');
  const verified = searchParams.get('verified');
  const error = searchParams.get('error');

  useEffect(() => {
    if (verified === 'true') {
      setStatus('verified');
    } else if (error) {
      setStatus('error');
    }
  }, [verified, error]);
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-red-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (status === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-red-950">
        <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-amber-400/30">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email vérifié avec succès ! 🎉</h1>
            <p className="text-amber-200 mb-6">
              Votre compte LD Comedy est maintenant activé. Vous pouvez vous connecter et commencer à explorer la plateforme.
            </p>
          </div>
          
          <div className="space-y-3">
            <a 
              href="/connexion" 
              className="w-full bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 text-red-950 py-3 px-4 rounded-xl font-semibold transition-all duration-200 block shadow-lg hover:shadow-xl"            >
              Se connecter
            </a>
            <a 
              href="/" 
              className="w-full border border-amber-400/20 text-amber-200 py-3 px-4 rounded-xl font-semibold hover:bg-amber-400/10 transition-all duration-200 block"
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Status error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950 to-red-950">
      <div className="max-w-md w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-red-500/30">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Erreur de vérification</h1>
          <p className="text-red-200 mb-6">
            Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau lien de vérification.
          </p>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = '/resend-verification'}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Renvoyer l'email de vérification
          </button>
          <a 
            href="/" 
            className="w-full border border-amber-400/20 text-amber-200 py-3 px-4 rounded-xl font-semibold hover:bg-amber-400/10 transition-all duration-200 block"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
