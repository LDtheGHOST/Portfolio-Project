# Structure du Projet LD Comedy

## 📁 Structure Organisée et Nettoyée

```
ld-comedy/
├── 📄 Configuration
│   ├── .env.example           # Template de configuration
│   ├── package.json           # Dépendances et scripts
│   ├── next.config.js         # Configuration Next.js
│   ├── tsconfig.json          # Configuration TypeScript
│   ├── postcss.config.mjs     # Configuration PostCSS
│   └── next-env.d.ts          # Types Next.js
│
├── 📊 Base de Données
│   └── prisma/
│       └── schema.prisma      # Schéma de base de données
│
├── 🎨 Assets Publics
│   └── public/
│       ├── favicon.ico
│       ├── *.png *.jpg        # Images du projet
│       └── image/             # Sous-dossier d'images
│
├── 💻 Code Source
│   └── src/
│       ├── 📱 app/                    # App Router Next.js 14
│       │   ├── layout.tsx             # Layout racine
│       │   ├── page.tsx               # Page d'accueil
│       │   ├── globals.css            # Styles globaux
│       │   ├── client-layout.tsx      # Layout côté client
│       │   │
│       │   ├── 🔌 api/                # API Routes
│       │   │   ├── auth/              # NextAuth.js
│       │   │   ├── artist/            # API Artistes
│       │   │   │   ├── notifications/ # Notifications artistes
│       │   │   │   ├── profile/       # Profil artiste
│       │   │   │   ├── search/        # Recherche artistes
│       │   │   │   ├── stats/         # Statistiques
│       │   │   │   └── [id]/          # Artiste par ID
│       │   │   ├── comedians/         # Liste des comédiens
│       │   │   │   └── [id]/          # Comédien par ID
│       │   │   ├── theater/           # API Théâtres (singulier)
│       │   │   │   ├── notifications/ # Notifications théâtres
│       │   │   │   └── profile/       # Profil théâtre
│       │   │   ├── theatres/          # Liste des théâtres (pluriel)
│       │   │   │   └── [id]/          # Théâtre par ID
│       │   │   ├── poster/            # Gestion des affiches
│       │   │   ├── poster-comment/    # Commentaires sur affiches
│       │   │   ├── poster-like/       # Likes sur affiches
│       │   │   ├── conversations/     # Messagerie
│       │   │   ├── messages/          # Messages
│       │   │   ├── friend/            # Système d'amis
│       │   │   ├── favorite/          # Favoris
│       │   │   ├── upload/            # Upload de fichiers
│       │   │   ├── register/          # Inscription
│       │   │   ├── user/              # Gestion utilisateurs
│       │   │   ├── reservations/      # Réservations
│       │   │   ├── debug/             # Debug (dev seulement)
│       │   │   └── home/              # APIs page d'accueil
│       │   │       ├── popular-posters/    # Affiches populaires
│       │   │       ├── featured-theaters/  # Théâtres à la une
│       │   │       └── successful-artists/ # Artistes à succès
│       │   │
│       │   └── 📄 pages/              # Pages de l'application
│       │       ├── choix-roles/       # Sélection du rôle
│       │       ├── connexion/         # Connexion
│       │       ├── register/          # Inscription
│       │       ├── contact/           # Contact
│       │       ├── spectacles/        # Liste des spectacles
│       │       ├── comediens/         # Pages comédiens
│       │       ├── theatre/           # Pages théâtres
│       │       ├── amis/              # Page amis
│       │       ├── mes-amis/          # Mes amis
│       │       ├── dashboard/         # Dashboard général
│       │       ├── dashboard-artiste/ # Dashboard artiste
│       │       │   ├── profile/       # Profil artiste
│       │       │   ├── amis/          # Amis artiste
│       │       │   ├── reseaux/       # Réseaux sociaux
│       │       │   └── settings/      # Paramètres
│       │       └── dashboard-theatre/ # Dashboard théâtre
│       │           ├── layout.tsx     # Layout spécifique
│       │           ├── profil/        # Profil théâtre
│       │           ├── affiches/      # Gestion affiches
│       │           ├── amis/          # Amis théâtre
│       │           ├── contact/       # Contacts
│       │           ├── documents/     # Documents
│       │           ├── parametres/    # Paramètres
│       │           └── partenariat/   # Partenariats
│       │
│       ├── 🧩 components/             # Composants réutilisables
│       │   ├── auth/                  # Authentification
│       │   │   └── auth-provider.tsx  # Provider d'auth
│       │   ├── layout/                # Layout components
│       │   │   ├── header.tsx         # En-tête
│       │   │   ├── footer.tsx         # Pied de page
│       │   │   └── navbar.tsx         # Barre de navigation
│       │   ├── ui/                    # Composants UI (shadcn/ui)
│       │   │   ├── button.tsx         # Boutons
│       │   │   ├── card.tsx           # Cartes
│       │   │   ├── input.tsx          # Champs de saisie
│       │   │   ├── label.tsx          # Labels
│       │   │   ├── select.tsx         # Sélecteurs
│       │   │   ├── textarea.tsx       # Zone de texte
│       │   │   ├── Toast.tsx          # Notifications
│       │   │   └── MediaUploader.tsx  # Upload de médias
│       │   ├── FriendButton.tsx       # Bouton d'ami
│       │   └── UserStatus.tsx         # Statut utilisateur
│       │
│       └── 🛠️ lib/                   # Utilitaires et configuration
│           ├── auth.ts                # Configuration NextAuth
│           ├── db.ts                  # Configuration base de données
│           ├── prisma.ts              # Client Prisma
│           └── utils.ts               # Fonctions utilitaires
│
└── 📚 Documentation
    ├── README.md                      # Documentation principale
    ├── MESSAGING_SYNC_DOCUMENTATION.md # Doc messagerie
    └── ROADMAP.txt                    # Feuille de route
```

## 🧹 Nettoyage Effectué

### ❌ Fichiers Supprimés
- `DELETE_ME_TO_REMOVE_ARTIST_API.txt`
- `DELETE_ME_TO_REMOVE_COMEDIENS_API.txt`
- `test-routes.js`
- `src/app/api/test-notifications/`
- `src/app/api/comediens/` (dupliqué avec comedians)
- `src/app/api/theatre/` (dupliqué avec theater/theatres)
- `src/app/api/artist/notifs/` (dupliqué avec notifications)

### ✅ Structure Unifiée
- **APIs Artistes** : `comedians` (cohérence anglaise)
- **APIs Théâtres** : `theater` (profil) + `theatres` (liste)
- **Notifications** : `notifications` (nom complet)
- **Conventions** : Noms anglais pour APIs, français pour pages utilisateur

## 📋 Conventions Adoptées

### 🔗 Routes API
- **Anglais** : Pour toutes les routes API (`/api/...`)
- **RESTful** : GET/POST/PUT/DELETE selon les besoins
- **Consistant** : Noms cohérents entre routes

### 📄 Pages
- **Français** : Pour les URLs utilisateur (`/comediens`, `/spectacles`)
- **Descriptif** : Noms clairs et explicites

### 🗂️ Organisation
- **Logique métier** : Séparation claire artistes/théâtres/système
- **Réutilisabilité** : Composants UI centralisés
- **Maintenabilité** : Structure modulaire et documentée

## 🚀 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run start            # Serveur de production

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:push          # Pousser le schéma
npm run db:studio        # Interface graphique
npm run db:reset         # Reset complet

# Qualité du code
npm run lint             # Linting ESLint
npm run type-check       # Vérification TypeScript
npm run format           # Formatage du code

# Nettoyage
npm run clean            # Nettoyer les caches
```

Cette structure garantit un projet professionnel, maintenable et évolutif ! 🎯
