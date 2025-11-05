# Ajout Bouton "Voir Mon Profil" dans le Dashboard

## 🎯 Objectif
Ajouter un bouton dans l'en-tête "Mon Espace" du dashboard artiste pour accéder directement au profil public.

## 📝 Code à ajouter

Dans le fichier `src/app/dashboard-artiste/page.tsx`, à la **ligne 515** (juste avant le bouton "Nouvelle affiche"), ajoutez ce code :

```tsx
{/* Bouton Retour sur le site */}
{artistProfileId && (
  <Link
    href={`/comediens/${artistProfileId}`}
    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors text-sm"
  >
    <User className="w-4 h-4 mr-2" />
    <span className="hidden md:inline">Voir mon profil</span>
    <span className="md:hidden">Profil</span>
  </Link>
)}
```

## 📍 Emplacement exact

Trouvez cette section dans `src/app/dashboard-artiste/page.tsx` (vers la ligne 514) :

```tsx
              )}

              <button
                className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
                onClick={() => setShowPosterModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Nouvelle affiche</span>
              </button>
            </div>
```

Et remplacez-la par :

```tsx
              )}

              {/* Bouton Retour sur le site */}
              {artistProfileId && (
                <Link
                  href={`/comediens/${artistProfileId}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center transition-colors text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Voir mon profil</span>
                  <span className="md:hidden">Profil</span>
                </Link>
              )}

              <button
                className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-lg flex items-center transition-colors"
                onClick={() => setShowPosterModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Nouvelle affiche</span>
              </button>
            </div>
```

## ✅ Résultat

Après cette modification, vous aurez :
1. ✅ Bouton "Voir mon profil" (violet) dans l'en-tête du dashboard
2. ✅ Responsive : "Voir mon profil" sur desktop, "Profil" sur mobile
3. ✅ Navigation fluide dashboard ↔ profil public

## 🚫 Bouton "Dashboard" Supprimé

Le bouton "Dashboard" qui apparaissait sur le profil public a été supprimé car la navbar permet déjà de revenir au dashboard.

---

**Note** : Si le fichier continue d'être modifié automatiquement par un linter, attendez quelques secondes après avoir sauvegardé avant de tester.
