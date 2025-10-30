# 🚀 Configuration Vercel pour LD Comedy

## ⚠️ Problème : Lenteur de la base de données sur Vercel

Si votre application fonctionne en local mais est lente sur Vercel, suivez ces étapes :

---

## 📋 Étape 1 : Configurer les Variables d'Environnement sur Vercel

1. Allez sur **[vercel.com](https://vercel.com)** et ouvrez votre projet
2. Cliquez sur **Settings** → **Environment Variables**
3. Ajoutez **TOUTES** ces variables :

### Variables à ajouter :

```bash
# 🔐 Base de données MongoDB (AVEC optimisations)
DATABASE_URL
mongodb+srv://ldcomedyparis:Ld123456789T@cluster0.pdvex4y.mongodb.net/ld_comedy?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=10000&serverSelectionTimeoutMS=5000&socketTimeoutMS=10000

# 🔑 NextAuth Secret (générez un nouveau secret sécurisé)
NEXTAUTH_SECRET
[Collez le résultat de: openssl rand -base64 32]

# 🌐 URL de votre application (IMPORTANT: utilisez votre URL Vercel)
NEXTAUTH_URL
https://votre-app-vercel.vercel.app

# ☁️ Cloudinary (Upload d'images)
CLOUDINARY_CLOUD_NAME
dzlbjdsip

CLOUDINARY_API_KEY
118776391958262

CLOUDINARY_API_SECRET
RbaRcjgbPgPB2JCfrW_dJXh7OAw
```

### ⚡ Important :
- **Ne mettez PAS** `localhost` dans `NEXTAUTH_URL` sur Vercel !
- Utilisez votre vraie URL Vercel (ex: `https://ld-comedy.vercel.app`)

---

## 🗄️ Étape 2 : Configurer MongoDB Atlas

1. Allez sur **[MongoDB Atlas](https://cloud.mongodb.com)**
2. Cliquez sur votre cluster → **Network Access**
3. Ajoutez **0.0.0.0/0** dans la liste des IP autorisées
   - ⚠️ Cela autorise toutes les IP (nécessaire pour Vercel)
   - Vercel utilise des IP dynamiques

---

## 🔧 Étape 3 : Vérifier la Configuration

### Générer un NEXTAUTH_SECRET

Sur votre terminal local, exécutez :

```bash
openssl rand -base64 32
```

Copiez le résultat et utilisez-le comme valeur pour `NEXTAUTH_SECRET` sur Vercel.

---

## 📊 Étape 4 : Tester la Configuration

Une fois déployé, testez ces endpoints :

### 1. Test de santé de l'API
```
https://votre-app.vercel.app/api/health
```

Ce endpoint vous dira si :
- ✅ Les variables d'environnement sont configurées
- ✅ La connexion MongoDB fonctionne
- ✅ Prisma est initialisé

### 2. Test d'inscription
```
https://votre-app.vercel.app/register
```

---

## 🐛 Étape 5 : Consulter les Logs

Si vous avez toujours des erreurs :

1. Allez sur **Vercel Dashboard**
2. Cliquez sur votre projet
3. **Deployments** → Cliquez sur le dernier déploiement
4. **Functions** → `/api/register`
5. Consultez les **logs en temps réel**

Les logs détaillés vous montreront exactement où se trouve le problème.

---

## 📝 Explications des Optimisations MongoDB

Les paramètres ajoutés à `DATABASE_URL` :

- `maxPoolSize=10` : Maximum 10 connexions dans le pool
- `minPoolSize=1` : Minimum 1 connexion active
- `maxIdleTimeMS=10000` : Ferme les connexions inactives après 10s
- `serverSelectionTimeoutMS=5000` : Timeout de 5s pour sélectionner un serveur
- `socketTimeoutMS=10000` : Timeout de 10s pour les opérations socket

Ces paramètres évitent :
- ❌ Trop de connexions ouvertes (coûteux)
- ❌ Connexions qui traînent (ralentissement)
- ❌ Timeouts trop longs (mauvaise UX)

---

## ✅ Checklist Finale

Avant de redéployer :

- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] `NEXTAUTH_URL` pointe vers l'URL Vercel (pas localhost)
- [ ] `NEXTAUTH_SECRET` généré avec OpenSSL
- [ ] MongoDB Atlas autorise 0.0.0.0/0
- [ ] `DATABASE_URL` contient les paramètres d'optimisation
- [ ] Code git push vers le repo

---

## 🆘 Problèmes Courants

### Erreur 500 sur `/api/register`
- ❌ Variables d'environnement manquantes
- ❌ `DATABASE_URL` incorrecte
- ❌ MongoDB refuse les connexions depuis Vercel

### Connexion lente
- ❌ Paramètres d'optimisation manquants dans `DATABASE_URL`
- ❌ Cluster MongoDB trop éloigné géographiquement
- ❌ Plan gratuit MongoDB (limitée en performance)

### "Prisma not initialized"
- ❌ `prisma generate` n'a pas été exécuté lors du build
- ❌ Vérifiez que `package.json` contient : `"build": "prisma generate && next build"`

---

## 🎯 Résultat Attendu

Après ces optimisations :
- ✅ Inscription en 2-5 secondes max
- ✅ Connexion rapide
- ✅ Pas d'erreur 500
- ✅ Logs propres sans erreurs

---

**Besoin d'aide ?** Consultez les logs Vercel ou testez `/api/health` !
