# 🔍 DIAGNOSTIC VERCEL - Pas de données

## LE PROBLÈME
✅ Ça marche en local
❌ Ça ne marche pas sur Vercel (erreur 500, t.map is not a function)

---

## 🧪 TESTS DE DIAGNOSTIC

### **Test 1 : Vérifier que Vercel voit les variables d'environnement**

Allez sur cette URL :
```
https://ld-comedy-show.vercel.app/api/health
```

**Si vous voyez :**
```json
{
  "status": "unhealthy",
  "error": "...",
  "environment": {
    "DATABASE_URL": false,  ⚠️ PROBLÈME ICI
    "NEXTAUTH_SECRET": false,
    ...
  }
}
```
➡️ **SOLUTION :** Les variables d'environnement ne sont PAS configurées sur Vercel !

**Si vous voyez :**
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "userCount": 5
  }
}
```
➡️ Tout fonctionne ! Le problème est ailleurs.

---

### **Test 2 : Vérifier la version du code déployé**

```
https://ld-comedy-show.vercel.app/api/version
```

**Attendu :**
```json
{
  "version": "2.0.0-fixed-map-error",
  ...
}
```

**Si vous ne voyez PAS cette version :**
➡️ Vercel utilise encore l'ancien code (problème de cache)

---

## 🔧 SOLUTIONS PAR PROBLÈME

### **Problème 1 : MongoDB refuse les connexions depuis Vercel**

#### Symptômes :
- `/api/health` retourne `"Server selection timeout"`
- Erreur : `"No available servers"`

#### Solution :
1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Cliquez sur votre cluster **cluster0**
3. Menu **Network Access** (à gauche)
4. Si vous voyez seulement votre IP locale : **PROBLÈME TROUVÉ**
5. Cliquez **Add IP Address**
6. Entrez : `0.0.0.0/0` (Description: "Vercel")
7. Cliquez **Confirm**
8. Attendez 1-2 minutes
9. Re-testez `/api/health`

---

### **Problème 2 : Variables d'environnement non configurées**

#### Symptômes :
- `/api/health` retourne `DATABASE_URL: false`
- `/api/version` retourne `DATABASE_URL_exists: false`

#### Solution :
Vercel → Settings → Environment Variables

**VÉRIFIEZ QUE CES 7 VARIABLES EXISTENT :**

| Variable | Valeur commence par... | Coché ? |
|----------|------------------------|---------|
| DATABASE_URL | `mongodb+srv://` | ✅ Prod + Preview + Dev |
| NEXTAUTH_URL | `https://ld-comedy-show` | ✅ Prod + Preview + Dev |
| NEXTAUTH_SECRET | (32+ caractères) | ✅ Prod + Preview + Dev |
| CLOUDINARY_CLOUD_NAME | `dzlbjdsip` | ✅ Prod + Preview + Dev |
| CLOUDINARY_API_KEY | `118776391958262` | ✅ Prod + Preview + Dev |
| CLOUDINARY_API_SECRET | (texte long) | ✅ Prod + Preview + Dev |
| CLOUDINARY_URL | `cloudinary://` | ✅ Prod + Preview + Dev |

**Si une variable manque ou est mal cochée :**
1. Supprimez-la
2. Re-créez-la
3. Cochez **TOUS** les environnements
4. Redéployez

---

### **Problème 3 : Cache Vercel (ancien code)**

#### Symptômes :
- `/api/version` ne retourne PAS `"2.0.0-fixed-map-error"`
- Erreur `t.map is not a function` persiste

#### Solution :
1. Vercel → **Deployments**
2. Cliquez sur le **dernier déploiement**
3. Cliquez **⋯** (3 points en haut à droite)
4. Cliquez **Redeploy**
5. **IMPORTANT :** ❌ DÉCOCHEZ "Use existing Build Cache"
6. Cliquez **Redeploy**
7. Attendez 3-5 minutes
8. Re-testez `/api/version`

---

### **Problème 4 : DATABASE_URL incorrecte**

#### Vérifiez sur Vercel que DATABASE_URL contient :

✅ `ssl=true`
✅ `tls=true`
✅ `tlsAllowInvalidCertificates=true`
✅ `maxPoolSize=10`
✅ `serverSelectionTimeoutMS=10000`

**DATABASE_URL complète attendue :**
```
mongodb+srv://ldcomedyparis:Ld123456789T@cluster0.pdvex4y.mongodb.net/ld_comedy?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=10000&serverSelectionTimeoutMS=10000&socketTimeoutMS=10000&ssl=true&tls=true&tlsAllowInvalidCertificates=true
```

Si ça ne correspond pas :
1. Supprimez DATABASE_URL sur Vercel
2. Re-créez-la avec la bonne valeur
3. Redéployez SANS cache

---

## 📋 CHECKLIST DE DIAGNOSTIC

Faites ces tests dans l'ordre :

- [ ] **Test 1 :** Allez sur `/api/health` - Que voyez-vous ?
- [ ] **Test 2 :** Allez sur `/api/version` - Version = "2.0.0-fixed-map-error" ?
- [ ] **Test 3 :** MongoDB Atlas - Network Access autorise 0.0.0.0/0 ?
- [ ] **Test 4 :** Vercel Environment Variables - 7 variables présentes ?
- [ ] **Test 5 :** DATABASE_URL contient ssl=true&tls=true ?
- [ ] **Test 6 :** Redéployé SANS cache ?

---

## 🎯 ACTIONS À FAIRE MAINTENANT

### **1. Testez `/api/health`**
```
https://ld-comedy-show.vercel.app/api/health
```

### **2. Copiez-collez le résultat ici**

Si vous voyez une erreur, **copiez le message complet**.

### **3. Selon le résultat :**

| Résultat | Action |
|----------|--------|
| `"status": "healthy"` | Problème résolu ! Testez la page d'accueil |
| `"DATABASE_URL": false` | Variables d'environnement manquantes |
| `"Server selection timeout"` | MongoDB bloque Vercel (Network Access) |
| `"version": "1.0.0"` | Cache Vercel, redéployer sans cache |
| Page ne charge pas | Problème de déploiement |

---

## 💡 ASTUCE : Voir les logs en temps réel

1. Vercel → Deployments → Dernier déploiement
2. Cliquez sur **Functions**
3. Cliquez sur `/api/health`
4. Vous verrez les logs console.log

Si vous voyez :
```
🏥 Health check démarré
❌ Server selection timeout
```
➡️ C'est MongoDB qui bloque !

---

**Testez `/api/health` et dites-moi ce que vous voyez !** 🔍
