# 🚀 Migration MongoDB → PostgreSQL (Neon)

## ✅ Changements effectués (commit: bcc5d49)

Nous avons migré de **MongoDB Atlas** vers **PostgreSQL (Neon)** pour résoudre les problèmes de connexion sur Vercel.

---

## 📋 CE QUI A ÉTÉ FAIT

1. ✅ Mise à jour de `DATABASE_URL` vers PostgreSQL (Neon)
2. ✅ Conversion du schéma Prisma de MongoDB vers PostgreSQL
3. ✅ Remplacement des ObjectId par UUID
4. ✅ Conversion des types composés (SocialLinks, etc.) en JSON
5. ✅ Création de la base de données sur Neon
6. ✅ Backup du schéma MongoDB (`schema.prisma.mongodb.backup`)

---

## 🔧 CE QUE VOUS DEVEZ FAIRE MAINTENANT

### **Étape 1 : Mettre à jour la variable DATABASE_URL sur Vercel**

⚠️ **CRITIQUE** - C'est la seule étape obligatoire !

1. Allez sur [Vercel Dashboard](https://vercel.com)
2. Sélectionnez votre projet **ld-comedy-show**
3. **Settings** → **Environment Variables**
4. Trouvez `DATABASE_URL`
5. Cliquez sur **Edit**
6. Remplacez la valeur par :

```
postgresql://neondb_owner:npg_BlouReZ4smn2@ep-still-breeze-ad34ng10-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

7. **Assurez-vous que** Production ✅ Preview ✅ Development ✅ **sont cochés**
8. Cliquez **Save**

---

### **Étape 2 : Redéployer sur Vercel**

1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. **⋯** (3 points) → **Redeploy**
4. ❌ **DÉCOCHEZ** "Use existing Build Cache"
5. Cliquez **Redeploy**
6. **Attendez 3-5 minutes**

---

### **Étape 3 : Tester**

Une fois déployé, testez ces URLs :

```
https://ld-comedy-show.vercel.app/api/test-db
https://ld-comedy-show.vercel.app/api/health
https://ld-comedy-show.vercel.app/api/register
https://ld-comedy-show.vercel.app/
```

---

## ✅ RÉSULTATS ATTENDUS

Après le redéploiement :

### `/api/test-db` devrait retourner :
```json
{
  "success": true,
  "logs": [
    "1. ✅ Route API appelée",
    "2. DATABASE_URL existe: true",
    "4. Prisma existe: true",
    "6. ✅ Connexion réussie en XXms",
    "8. ✅ Requête réussie - 0 utilisateurs",
    "9. ✅ TOUS LES TESTS RÉUSSIS !"
  ]
}
```

### `/api/health` devrait retourner :
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "userCount": 0
  }
}
```

### La page d'accueil devrait :
- ✅ Se charger en 2-5 secondes
- ✅ Afficher correctement (pas d'erreur `t.map is not a function`)
- ✅ Permettre l'inscription
- ✅ Permettre la connexion

---

## 🎯 AVANTAGES DE NEON vs MONGODB

| Aspect | MongoDB Atlas | Neon PostgreSQL |
|--------|--------------|-----------------|
| **Compatibilité Vercel** | ❌ Problèmes de connexion | ✅ Parfait |
| **Vitesse sur Vercel** | ⚠️ Lent (10-30s) | ✅ Rapide (1-3s) |
| **SSL/TLS** | ⚠️ Complexe | ✅ Simple |
| **Network Access** | ❌ Besoin de 0.0.0.0/0 | ✅ Pas besoin |
| **Free Tier** | ✅ 512MB | ✅ 0.5GB |

---

## 📊 MIGRATION DES DONNÉES (Si nécessaire)

Si vous aviez des données dans MongoDB et que vous voulez les migrer :

1. Exportez depuis MongoDB :
```bash
mongoexport --uri="mongodb+srv://..." --collection=users --out=users.json
```

2. Transformez et importez dans PostgreSQL (via Prisma)

**Note :** La base Neon est actuellement vide, c'est normal !

---

## 🔄 RETOUR EN ARRIÈRE (Si problème)

Si Neon ne fonctionne pas, vous pouvez revenir à MongoDB :

```bash
# Restaurer le schéma MongoDB
cp prisma/schema.prisma.mongodb.backup prisma/schema.prisma

# Mettre à jour .env
DATABASE_URL="mongodb+srv://..."

# Push et redéployer
git add . && git commit -m "rollback to MongoDB" && git push
```

Puis sur Vercel, remettez l'ancienne `DATABASE_URL`.

---

## 🐛 SI PROBLÈMES

### Erreur "Database not found"
➡️ Vérifiez que `DATABASE_URL` est bien mise à jour sur Vercel

### Erreur "Connection timeout"
➡️ Vérifiez que le nom de la base est `neondb` (pas `ld_comedy`)

### Erreur 500 persiste
➡️ Consultez les logs Vercel : **Deployments → Functions → Logs**

---

**Date :** 2025-11-01
**Commit :** bcc5d49
**Status :** Prêt pour redéploiement

**➡️ ALLEZ MAINTENANT SUR VERCEL ET METTEZ À JOUR DATABASE_URL !** 🎯
