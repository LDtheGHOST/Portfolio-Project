# LD Comedy - Plateforme de Comédie

Plateforme web Next.js 14 connectant artistes et théâtres dans l'univers de la comédie. Cette application full-stack utilise MongoDB, Prisma ORM et NextAuth pour créer un écosystème complet de découverte et de mise en relation dans le monde du spectacle vivant.

## 🎭 Vue d'ensemble

LD Comedy est une plateforme moderne qui permet aux :
- **Artistes/Comédiens** : Créer leur profil, publier des affiches de spectacles, gérer leurs contacts, trouver des opportunités
- **Théâtres** : Présenter leur établissement, découvrir des talents, organiser des événements, programmer des spectacles
- **Visiteurs** : Découvrir des spectacles, suivre des artistes, explorer l'actualité de la comédie

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend** : Next.js 14 (App Router), React 18, TypeScript
- **Backend** : Next.js API Routes (Server-Side)
- **Base de données** : MongoDB avec Prisma ORM
- **Authentification** : NextAuth.js avec credentials provider
- **UI** : Tailwind CSS + shadcn/ui + Framer Motion
- **Email** : Resend (ou SendGrid/EmailJS en alternative)
- **Upload** : Cloudinary pour les images/vidéos

### Architecture Front-End ↔ Back-End

```
┌─────────────────┐    HTTP/API     ┌─────────────────┐    Prisma     ┌─────────────────┐
│   CLIENT-SIDE   │ ←──────────→    │   SERVER-SIDE   │ ←──────────→  │     DATABASE    │
│                 │                 │                 │               │                 │
│ Pages/Components│                 │  API Routes     │               │    MongoDB      │
│ - /dashboard    │                 │  - /api/artist  │               │    Collections  │
│ - /comediens    │                 │  - /api/theater │               │    - users      │
│ - /theatre      │                 │  - /api/poster  │               │    - posters    │
│ - /connexion    │                 │  - /api/auth    │               │    - messages   │
│                 │                 │  - /api/home    │               │    - favorites  │
│ State Management│                 │                 │               │    - etc...     │
│ - useState      │                 │  Business Logic │               │                 │
│ - useEffect     │                 │  - Validation   │               │   Relationships │
│ - Context API   │                 │  - Email        │               │   - User ←→ Profile │
│                 │                 │  - Auth         │               │   - Poster ←→ Author│
└─────────────────┘                 └─────────────────┘               └─────────────────┘
```

## 🗄️ Modèle de Données & Relations

### Entités Principales

#### 1. **User** (Utilisateur Base)
```typescript
// Table centrale de tous les utilisateurs
User {
  id: String                    // ID unique
  email: String                 // Email unique pour connexion
  password: String              // Mot de passe hashé
  name: String                  // Nom d'affichage
  role: Role                    // ARTIST | THEATER | ADMIN
  emailVerified: DateTime?      // Statut de vérification
  isVerified: Boolean           // Compte validé
  
  // Relations 1:1
  artistProfile: ArtistProfile?  // Si c'est un artiste
  theaterProfile: TheaterProfile? // Si c'est un théâtre
}
```

#### 2. **ArtistProfile** (Profil Artiste)
```typescript
// Extension des données pour les artistes
ArtistProfile {
  userId: String @unique        // Lien vers User
  stageName: String?            // Nom de scène
  bio: String?                  // Biographie
  specialties: String[]         // ["Stand-up", "Théâtre"]
  location: String?             // Ville/région
  
  // Relations 1:N
  posters: Poster[]             // Affiches créées
  videos: Video[]               // Vidéos uploaded
  photos: Photo[]               // Photos de profil
  favorites: Favorite[]         // Relations avec théâtres
}
```

#### 3. **TheaterProfile** (Profil Théâtre)
```typescript
// Extension des données pour les théâtres
TheaterProfile {
  userId: String @unique        // Lien vers User
  theaterName: String?          // Nom du théâtre
  description: String?          // Description de l'établissement
  capacity: Int?                // Capacité de la salle
  address: String?              // Adresse complète
  
  // Relations 1:N
  posters: Poster[]             // Affiches publiées
  ownedEvents: Event[]          // Événements organisés
  favorites: Favorite[]         // Relations avec artistes
}
```

#### 4. **Poster** (Affiche de Spectacle)
```typescript
// Affiches créées par artistes OU théâtres
Poster {
  id: String
  imageUrl: String              // URL de l'image
  description: String?          // Description du spectacle
  likes: String[]               // IDs des utilisateurs qui ont liké
  
  // Relations optionnelles (OU exclusif)
  artistId: String?             // Si créé par un artiste
  artist: ArtistProfile?
  theaterId: String?            // Si créé par un théâtre  
  theater: TheaterProfile?
  
  // Relations 1:N
  comments: PosterComment[]     // Commentaires
}
```

### Relations Complexes

#### 5. **Favorite** (Système d'Amis/Favoris)
```typescript
// Relation Many-to-Many entre Artistes et Théâtres
Favorite {
  theaterId: String             // ID du théâtre
  artistId: String              // ID de l'artiste
  status: FavoriteStatus        // PENDING | ACCEPTED | REJECTED
  requestedBy: String?          // "theater" ou "artist"
  notes: String?                // Notes privées
  
  // Relations
  theater: TheaterProfile
  artist: ArtistProfile
}
```

#### 6. **Conversation & Message** (Messagerie)
```typescript
// Système de chat entre utilisateurs
Conversation {
  participants: String[]         // IDs des participants
  lastMessage: String?          // Dernier message
  messages: Message[]           // Tous les messages
}

Message {
  content: String               // Contenu du message
  senderId: String              // Expéditeur
  conversationId: String        // Conversation parente
  isRead: Boolean               // Statut de lecture
}
```

## 🔄 Flux de Données Front ↔ Back

### 1. **Page d'Accueil** (`/`)
```typescript
// Frontend: src/app/page.tsx
useEffect(() => {
  // Appels API parallèles
  fetch('/api/home/popular-posters')    // Affiches populaires
  fetch('/api/home/featured-theaters')  // Théâtres à la une
  fetch('/api/home/successful-artists') // Artistes talentueux
}, [])

// Backend: src/app/api/home/popular-posters/route.ts
export async function GET() {
  const posters = await prisma.poster.findMany({
    include: {
      artist: { include: { user: true } },
      theater: { include: { user: true } },
      comments: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  // Enrichissement des données avec compteurs de likes/commentaires
  return NextResponse.json(enrichedPosters)
}
```

### 2. **Dashboard Artiste** (`/dashboard-artiste`)
```typescript
// Frontend: Récupération du profil complet
const [profile, setProfile] = useState(null)

useEffect(() => {
  fetch('/api/artist/profile')
    .then(res => res.json())
    .then(data => setProfile(data))
}, [])

// Backend: src/app/api/artist/profile/route.ts
export async function GET(request) {
  const session = await getServerSession()
  
  const artistProfile = await prisma.artistProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      posters: true,
      videos: true,
      photos: true,
      favorites: {
        include: { theater: { include: { user: true } } }
      }
    }
  })
  
  return NextResponse.json(artistProfile)
}
```

### 3. **Système de Favoris/Amis**
```typescript
// Frontend: Envoi d'une demande d'ami
const sendFriendRequest = async (artistId) => {
  const response = await fetch('/api/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      artistId, 
      action: 'request' 
    })
  })
}

// Backend: src/app/api/favorite/route.ts
export async function POST(request) {
  const { artistId, action } = await request.json()
  const session = await getServerSession()
  
  if (action === 'request') {
    const favorite = await prisma.favorite.create({
      data: {
        theaterId: session.user.theaterProfile.id,
        artistId: artistId,
        status: 'PENDING',
        requestedBy: 'theater'
      }
    })
    
    // Créer une notification
    await prisma.notification.create({
      data: {
        userId: artistId,
        type: 'FRIEND_REQUEST',
        title: 'Nouvelle demande d\'ami',
        message: `${session.user.name} souhaite vous ajouter`
      }
    })
  }
  
  return NextResponse.json({ success: true })
}
```

### 4. **Authentification & Sessions**
```typescript
// Frontend: Connexion utilisateur
const handleLogin = async (email, password) => {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  })
  
  if (result?.ok) {
    router.push('/dashboard')
  }
}

// Backend: src/lib/auth.ts (NextAuth configuration)
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            artistProfile: true,
            theaterProfile: true
          }
        })
        
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profile: user.artistProfile || user.theaterProfile
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    }
  }
}
```

## 📡 Architecture API

### Structure des Routes API
```
src/app/api/
├── auth/                    # Authentification NextAuth
│   ├── [...nextauth]/       # Route NextAuth
│   ├── verify-email/        # Vérification email
│   └── forgot-password/     # Reset password
├── artist/                  # Gestion artistes
│   ├── profile/             # CRUD profil artiste
│   ├── posters/             # Affiches d'un artiste
│   └── favorites/           # Théâtres favoris
├── theater/                 # Gestion théâtres
│   ├── profile/             # CRUD profil théâtre
│   ├── events/              # Événements du théâtre
│   └── artists/             # Artistes en relation
├── poster/                  # Gestion affiches
│   ├── route.ts             # CRUD affiches
│   ├── like/                # Like/unlike
│   └── comment/             # Commentaires
├── home/                    # Données page d'accueil
│   ├── popular-posters/     # Affiches populaires
│   ├── featured-theaters/   # Théâtres vedettes
│   └── successful-artists/  # Artistes talentueux
├── conversations/           # Messagerie
│   ├── route.ts             # Liste conversations
│   └── [id]/                # Messages d'une conversation
└── upload/                  # Upload fichiers
    └── route.ts             # Upload vers Cloudinary
```

### Patterns API Utilisés

#### 1. **CRUD Standard**
```typescript
// GET: Lecture
export async function GET(request, { params }) {
  const { id } = params
  const item = await prisma.model.findUnique({ where: { id } })
  return NextResponse.json(item)
}

// POST: Création
export async function POST(request) {
  const data = await request.json()
  const item = await prisma.model.create({ data })
  return NextResponse.json(item)
}

// PUT: Mise à jour
export async function PUT(request, { params }) {
  const { id } = params
  const data = await request.json()
  const item = await prisma.model.update({ where: { id }, data })
  return NextResponse.json(item)
}

// DELETE: Suppression
export async function DELETE(request, { params }) {
  const { id } = params
  await prisma.model.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
```

#### 2. **Middleware d'Authentification**
```typescript
// Vérification session dans chaque route protégée
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}
```

#### 3. **Gestion des Relations**
```typescript
// Inclusion des données liées avec Prisma
const artistWithRelations = await prisma.artistProfile.findUnique({
  where: { id },
  include: {
    user: true,              // Données utilisateur
    posters: {               // Affiches avec leurs détails
      include: {
        comments: true,
        _count: { select: { likes: true } }
      }
    },
    favorites: {             // Relations avec théâtres
      where: { status: 'ACCEPTED' },
      include: {
        theater: {
          include: { user: true }
        }
      }
    }
  }
})
```

## 🚀 Installation & Configuration

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- Compte Cloudinary (images)
- Compte Resend (emails)

### Installation
```bash
# 1. Cloner et installer
git clone [REPO_URL]
cd ld-comedy
npm install

# 2. Configuration environnement
cp .env.example .env.local
# Remplir DATABASE_URL, NEXTAUTH_SECRET, CLOUDINARY_*, RESEND_API_KEY

# 3. Base de données
npx prisma generate
npx prisma db push

# 4. Lancer en développement
npm run dev
```

### Variables d'Environnement
```env
# Base de données
DATABASE_URL="mongodb://..."

# Authentification
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Upload images
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"

# Emails
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@ldcomedy.com"
```

## 🛠️ Développement

### Commandes Utiles
```bash
# Base de données
npm run db:studio     # Interface Prisma Studio
npm run db:reset      # Reset complet DB
npm run db:push       # Sync schema

# Développement
npm run dev          # Serveur dev (port 3000)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
```

### Structure de Développement
```
src/
├── app/                    # App Router Next.js 14
│   ├── (auth)/            # Routes d'authentification
│   ├── dashboard-*/       # Dashboards protégés
│   ├── api/               # API Routes backend
│   └── globals.css        # Styles globaux
├── components/            # Composants réutilisables
│   ├── auth/             # Auth components
│   ├── ui/               # UI components (shadcn)
│   └── layout/           # Layout components
├── lib/                  # Utilitaires
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Fonctions utils
│   └── email.ts          # Service email
└── types/                # Types TypeScript
```

## 👨‍💻 Développé par

**Luis David Cuevas**  
Plateforme full-stack pour l'écosystème de la comédie parisienne.

## 📧 Système d'Emails

### Fonctionnalités Email Intégrées
- **Vérification d'email** : Envoi automatique lors de l'inscription avec token sécurisé
- **Email de bienvenue** : Après vérification du compte avec design personnalisé
- **Réinitialisation mot de passe** : Lien sécurisé avec expiration automatique
- **Templates HTML responsive** : Design cohérent avec l'identité LD Comedy

### Configuration Email
```typescript
// src/lib/email.ts - Service Resend
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Vérifiez votre compte LD Comedy',
    html: verificationEmailTemplate(verifyUrl)
  })
}
```

### Routes Email Disponibles
- `/api/auth/verify-email` : Vérification automatique via token
- `/api/auth/forgot-password` : Demande de reset password
- `/resend-verification` : Interface pour renvoyer email de vérification
- `/email-verification` : Page de statut de vérification

## 🔐 Authentification & Sécurité

### NextAuth.js Configuration
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Vérification utilisateur en base
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
          include: { artistProfile: true, theaterProfile: true }
        })
        
        // Vérification mot de passe + email vérifié
        if (user && user.isVerified && 
            await bcrypt.compare(credentials?.password, user.password)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role
      return session
    }
  }
}
```

### Protection des Routes
```typescript
// Middleware d'authentification
async function requireAuth(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  return session
}

// Usage dans les API routes
export async function GET(request: Request) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  
  // Logic protégée...
}
```

## 📱 Interface Utilisateur

### Design System
- **Palette de couleurs** : Noir profond, Rouge passion, Violet mystique, Amber doré
- **Typography** : Police moderne avec hiérarchie claire
- **Animations** : Framer Motion pour micro-interactions fluides
- **Responsive** : Mobile-first design avec breakpoints Tailwind

### Composants UI (shadcn/ui)
```typescript
// Composants réutilisables dans src/components/ui/
- Button : Boutons avec variants et tailles
- Card : Cartes avec effets glassmorphism
- Input : Champs de saisie stylisés
- Dialog : Modales et popups
- Badge : Labels et statuts
- Avatar : Images de profil avec fallback
```

### Pages Principales
```typescript
// Structure des pages avec Server/Client Components
src/app/
├── page.tsx                 # Accueil (Server Component + client features)
├── connexion/page.tsx       # Authentification avec NextAuth
├── register/page.tsx        # Inscription + vérification email
├── dashboard-artiste/       # Espace artiste protégé
│   ├── page.tsx            # Dashboard principal
│   ├── profile/page.tsx    # Gestion profil
│   ├── amis/page.tsx       # Réseau de contacts
│   └── settings/page.tsx   # Paramètres compte
├── dashboard-theatre/       # Espace théâtre protégé
│   ├── page.tsx            # Dashboard principal
│   ├── profil/page.tsx     # Gestion profil
│   ├── affiches/page.tsx   # Gestion affiches
│   └── contact/page.tsx    # Annuaire artistes
├── comediens/              # Annuaire public artistes
│   ├── page.tsx            # Liste avec filtres
│   └── [id]/page.tsx       # Profil détaillé
└── theatre/                # Annuaire public théâtres
    ├── page.tsx            # Liste avec recherche
    └── [id]/page.tsx       # Profil détaillé
```

## 🚀 Optimisations & Performance

### Next.js 14 Features
- **App Router** : Nouvelle architecture avec Server/Client Components
- **Server Actions** : Actions serveur directes dans les composants
- **Streaming** : Chargement progressif des données
- **Image Optimization** : Optimisation automatique via `next/image`

### Stratégies de Cache
```typescript
// API Routes avec cache stratégique
export async function GET() {
  const data = await prisma.poster.findMany()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}

// Pages avec revalidation
export const revalidate = 3600 // 1 heure
```

### SEO & Métadonnées
```typescript
// Métadonnées dynamiques par page
export async function generateMetadata({ params }): Promise<Metadata> {
  const artist = await getArtist(params.id)
  
  return {
    title: `${artist.stageName} - Artiste LD Comedy`,
    description: artist.bio,
    openGraph: {
      title: artist.stageName,
      description: artist.bio,
      images: [artist.coverImage],
    },
  }
}
```

## 🔧 Commandes utiles

```bash
# Base de données
npm run db:studio     # Prisma Studio
npm run db:reset      # Reset DB
npm run db:push       # Push schema

# Développement  
npm run dev          # Serveur dev
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # Linting
```

## 👨‍💻 Développé par

Luis David Cuevas
