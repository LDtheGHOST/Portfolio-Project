export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-white">Politique de confidentialité</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 mb-4">
          Nous prenons la protection de vos données personnelles très au sérieux.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">1. Collecte des données</h2>
        <p className="text-gray-300 mb-4">
          Nous collectons uniquement les informations nécessaires au fonctionnement de notre plateforme.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Utilisation des données</h2>
        <p className="text-gray-300 mb-4">
          Vos données sont utilisées pour améliorer votre expérience sur LD Comedy et ne sont jamais vendues à des tiers.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4 text-white">3. Sécurité</h2>
        <p className="text-gray-300 mb-4">
          Nous utilisons des mesures de sécurité standards pour protéger vos informations.
        </p>
      </div>
    </div>
  )
}
