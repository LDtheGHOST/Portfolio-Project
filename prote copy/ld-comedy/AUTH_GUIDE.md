# Guide d'authentification NextAuth - LD Comedy

## Configuration de l'authentification

### 1. Variables d'environnement

Copiez le fichier `.env.example` vers `.env.local` et configurez les variables suivantes :

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here-make-it-long-and-secure

# Base de données MongoDB
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 2. Structure d'authentification

L'authentification est basée sur NextAuth.js avec les composants suivants :

- **Provider** : `CredentialsProvider` pour l'authentification par email/mot de passe
- **Adapter** : `PrismaAdapter` pour la persistance avec MongoDB
- **Session** : JWT avec une durée de 30 jours

### 3. Rôles utilisateurs

Le système supporte 4 rôles principaux :

- `PENDING` : Utilisateur en attente de validation de rôle
- `ARTIST` : Artiste/Comédien
- `THEATER` : Théâtre/Organisateur
- `ADMIN` : Administrateur système

### 4. Flux d'authentification

#### Inscription
1. L'utilisateur s'inscrit avec email/mot de passe
2. Le compte est créé avec le rôle `PENDING`
3. L'utilisateur reçoit un email de vérification
4. Après vérification, l'utilisateur choisit son rôle (Artiste ou Théâtre)

#### Connexion
1. L'utilisateur saisit ses identifiants
2. Le système vérifie les credentials
3. Une session JWT est créée
4. L'utilisateur est redirigé vers son dashboard approprié

### 5. Protection des routes

Les routes sont protégées par un middleware qui :
- Vérifie l'authentification
- Contrôle les rôles d'accès
- Redirige vers les pages appropriées

### 6. Composants d'authentification

#### Hooks personnalisés
- `useAuth()` : Hook principal pour l'authentification
- `useRequireAuth()` : Hook pour les composants nécessitant une authentification
- `useRequireRole()` : Hook pour les composants nécessitant un rôle spécifique

#### Composants de protection
- `<AuthGuard>` : Protège les composants nécessitant une authentification
- `<RoleGuard>` : Protège les composants nécessitant un rôle spécifique
- `<UnauthGuard>` : Affiche le contenu uniquement pour les utilisateurs non connectés

#### Composants UI
- `<AuthButton>` : Bouton de connexion/déconnexion
- `<UserProfile>` : Profil utilisateur avec informations de session
- `<UserBadge>` : Badge utilisateur avec rôle

### 7. Utilisation des composants

#### Protection d'une page
```tsx
import { RoleGuard } from '@/components/auth/role-guard'

export default function ArtistPage() {
  return (
    <RoleGuard requiredRole="ARTIST">
      <div>Contenu réservé aux artistes</div>
    </RoleGuard>
  )
}
```

#### Utilisation du hook d'authentification
```tsx
import { useAuth } from '@/hooks/use-auth'

export default function MyComponent() {
  const { user, isAuthenticated, role } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>
  }
  
  return <div>Bonjour {user?.name}</div>
}
```

#### Vérification côté serveur
```tsx
import { requireRole } from '@/lib/auth-utils'

export default async function ServerPage() {
  const user = await requireRole('ARTIST')
  
  return <div>Contenu pour {user.name}</div>
}
```

### 8. Gestion des erreurs

Les erreurs d'authentification sont gérées automatiquement :
- Redirections vers la page de connexion
- Messages d'erreur utilisateur
- Gestion des sessions expirées

### 9. Fonctionnalités avancées

#### Vérification d'email
- Envoi automatique d'email de vérification
- Tokens sécurisés avec expiration
- Interface de renvoi d'email

#### Réinitialisation de mot de passe
- Génération de tokens sécurisés
- Interface de réinitialisation
- Validation des nouveaux mots de passe

#### Gestion des sessions
- Sessions persistantes (30 jours)
- Rafraîchissement automatique
- Déconnexion sécurisée

### 10. Configuration de production

Pour la production, assurez-vous de :
1. Configurer un `NEXTAUTH_SECRET` sécurisé
2. Utiliser HTTPS pour `NEXTAUTH_URL`
3. Configurer les domaines autorisés
4. Activer les logs de sécurité

### 11. Dépannage

#### Problèmes courants
- **Session non persistante** : Vérifiez `NEXTAUTH_SECRET`
- **Redirections infinies** : Vérifiez les rôles et permissions
- **Erreurs de base de données** : Vérifiez la connexion MongoDB
- **Emails non envoyés** : Vérifiez la configuration email

#### Debugging
Le mode debug est activé en développement :
```bash
# Voir les logs d'authentification
NODE_ENV=development npm run dev
```

### 12. Sécurité

- Mots de passe hachés avec bcrypt
- Sessions JWT sécurisées
- Protection CSRF intégrée
- Validation des entrées utilisateur
- Tokens d'email sécurisés

Cette configuration fournit une authentification complète et sécurisée pour l'application LD Comedy.
