# 📧 Configuration EmailJS - Guide Pas à Pas

EmailJS vous permet d'envoyer des emails directement depuis votre Gmail **sans mot de passe d'application** !

## 🚀 Étapes de Configuration

### 1. Créer un compte EmailJS
1. Allez sur [emailjs.com](https://www.emailjs.com)
2. Cliquez sur "Sign Up" et créez un compte gratuit
3. Confirmez votre email

### 2. Connecter votre Gmail
1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Sélectionnez **"Gmail"**
4. Cliquez sur **"Connect Account"**
5. Connectez-vous avec `ldcomedyparis@gmail.com`
6. Autorisez EmailJS à envoyer des emails via votre compte
7. Notez le **Service ID** (ex: `service_xxxxxxx`)

### 3. Créer un Template d'Email
1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template :

```
From: {{from_name}} <{{from_email}}>
To: {{to_name}} <{{to_email}}>
Subject: {{subject}}

{{message}}
```

4. Sauvegardez et notez le **Template ID** (ex: `template_xxxxxxx`)

### 4. Obtenir la Public Key
1. Allez dans **"Account"** → **"General"**
2. Copiez votre **Public Key** (ex: `xxxxxxxxxxxxxxxx`)

### 5. Configurer le .env
```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID="service_xxxxxxx"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="template_xxxxxxx"  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## ✅ Test de Configuration

Après avoir configuré EmailJS, testez en visitant :
- `http://localhost:3000/resend-verification`
- Entrez votre email `ldcomedyparis@gmail.com`
- Vous devriez recevoir un email de test !

## 🔧 Template Avancé (Optionnel)

Pour des emails HTML plus beaux, utilisez ce template avancé :

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🎭 LD Comedy</h1>
    <p style="color: white; opacity: 0.9;">{{subject}}</p>
  </div>
  
  <div style="padding: 40px 20px; background: white;">
    <h2>Bonjour {{to_name}} !</h2>
    
    <div style="white-space: pre-line;">{{message}}</div>
    
    {{#verification_url}}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{verification_url}}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 25px; 
                font-weight: bold;">
        ✅ Vérifier mon email
      </a>
    </div>
    {{/verification_url}}
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <p style="color: #888; font-size: 12px; margin: 0;">
      © 2025 LD Comedy - by Luis David Cuevas
    </p>
  </div>
</div>
```

## 🎯 Avantages d'EmailJS

✅ **Gratuit** : 200 emails/mois  
✅ **Simple** : Pas de serveur email à configurer  
✅ **Sécurisé** : OAuth avec Google, pas de mot de passe  
✅ **Immédiat** : Fonctionne en 5 minutes  
✅ **Votre Email** : Utilise votre vraie adresse Gmail  

## 🚨 Limites

- 200 emails/mois en gratuit (suffisant pour commencer)
- Emails envoyés côté client (pas de problème pour la vérification)
- Pour plus de volume, passer à Resend/SendGrid plus tard

## 🔄 Alternative: Resend

Si vous préférez Resend plus tard :
1. Créez un compte sur [resend.com](https://resend.com)
2. Ajoutez votre domaine ou utilisez le domaine de test
3. Générez une API Key
4. Utilisez le service `/api/auth/verify-email` au lieu de `/api/auth/verify-email-simple`

Les deux systèmes sont prêts dans votre projet ! 🎉
