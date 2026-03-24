---
title: "**Authentification**"
sub_title: "Comment ça marche vraiment"
theme:
  name: catppuccin-latte
options:
  incremental_lists: true
---

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 1
========

## Le problème à résoudre

<!-- end_slide -->

Rappel — qu'est-ce qu'un état ?
================================

<!-- pause -->

> Avant la suite, de quoi on parle quand on parle de l'**état** d'une application ?

<!-- pause -->

Un **état** c'est une information **temporaire** qui décrit *où en est* l'utilisateur à un instant donné

```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false)
// → "est-ce que cet utilisateur est connecté ?" — la réponse change au fil du temps
```

<!-- pause -->

C'est différent d'une donnée en base :

| | Donnée en base | État |
|---|---|---|
| **Exemple** | `users` table, profil, commandes | "connecté", "panier en cours" |
| **Durée** | Permanente | Le temps d'une session |
| **Si perdu** | Problème grave | Souvent acceptable |
| **Stockage** | Base de données | Mémoire (front ou serveur) |

<!-- pause -->

> Pour l'authentification, l'état clé c'est : **"est-ce que ce navigateur est connecté, et en tant qui ?"**
> HTTP n'a aucun mécanisme natif pour le retenir — c'est tout le problème qu'on va résoudre

<!-- end_slide -->

HTTP Stateless
==============

HTTP est un protocole **sans mémoire**

Chaque requête est **isolée** — le serveur ne sait pas que vous étiez là avant

<!-- pause -->

Imaginez une boîte mail sans conversations :
- Vous voyez une liste de messages reçus
- Une liste de messages envoyés
- Mais **aucun fil conducteur** entre eux

<!-- pause -->

HTTP c'est pareil : `GET /profil` et `GET /commandes` n'ont **aucun lien automatique**

Le serveur ne sait pas que c'est le même utilisateur qui a fait les deux requêtes

<!-- pause -->

> C'est comme aller au supermarché sans carte de fidélité
> Chaque passage en caisse est **anonyme et indépendant**
> La carte de fidélité, c'est précisément ce qu'on va construire

<!-- end_slide -->

Anatomie d'une requête HTTP
============================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Requête**

```http
POST /login HTTP/1.1
Host: api.monsite.com
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "hunter2"
}
```

<!-- column: 1 -->

**Réponse**

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session=abc123; HttpOnly

{
  "message": "Connecté"
}
```

<!-- reset_layout -->

<!-- pause -->

| Élément | Rôle |
|---|---|
| **URL** | Quelle ressource ? |
| **Méthode** | Quelle action ? (`GET`, `POST`, `DELETE`…) |
| **Headers** | Métadonnées (`Content-Type`, `Authorization`, `Cookie`…) |
| **Body** | Données envoyées (HTML, JSON, form, multimédia…) |
| **Status** | Résultat (`200`, `401`, `403`, `500`…) |

<!-- end_slide -->

Garder un état malgré tout
===========================

Le protocole est stateless, mais on a des **outils** pour garder de l'état

<!-- pause -->

**Côté navigateur**

| Stockage | Durée | Accès JS | Accès serveur | Usage typique |
|---|---|---|---|---|
| `Cookie` | Configurable | Optionnel | ✅ lecture & écriture | Sessions, auth |
| `localStorage` | Permanent | Oui | ❌ JS uniquement | Préférences, tokens |
| `sessionStorage` | Onglet ouvert | Oui | ❌ JS uniquement | Données temporaires |

<!-- pause -->

**Côté serveur**

- Mémoire (volatile, ne survit pas au redémarrage)
- Cache distribué (Redis, Memcached…)
- Base de données

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 2
========

## Les fondations

<!-- end_slide -->

HTTPS — le prérequis absolu
=============================

**HTTPS = HTTP + TLS** — tout le trafic est **chiffré** entre le navigateur et le serveur

<!-- pause -->

Sans ça, n'importe qui sur le même réseau voit passer en clair :
- vos mots de passe
- vos cookies de session
- vos JWT

<!-- pause -->

> Tout ça voyage en clair si vous êtes en HTTP
> **HTTPS n'est pas une option**

<!-- end_slide -->

On ne fait pas confiance au front
===================================

Imagine qu'après `/login`, le serveur réponde juste :

```json
{ "userId": 42 }
```

Et que le front envoie `userId: 42` à chaque requête suivante…

<!-- pause -->

```http
GET /profil?userId=42
```

<!-- pause -->

Un attaquant n'a qu'à changer ce chiffre :

```http
GET /profil?userId=1
```

<!-- pause -->

**Il accède au profil de n'importe quel utilisateur**

> Le front peut être modifié, intercepté, falsifié
> **On ne laisse jamais le client s'auto-identifier**
> C'est le serveur qui doit vérifier l'identité à chaque requête

<!-- end_slide -->

Stocker les mots de passe
==========================

On ne stocke **jamais** un mot de passe en clair — on stocke un **hash**

<!-- pause -->

Ce qu'il faut retenir :

- **Irréversible** — impossible de retrouver le mot de passe depuis le hash
- **Non-déterministe** — hasher deux fois `"hunter2"` donne deux hashes différents (élément aléatoire intégré)
- **Vérifiable** — on peut quand même comparer un mot de passe saisi avec le hash stocké

```typescript
// À l'inscription — on hash avant de stocker
const hash = await bcrypt.hash("hunter2", 10)
// → "$2b$10$xK9mN...uQw3R"  (jamais le mot de passe en clair)

// À la connexion — on compare le mot de passe saisi avec le hash stocké
const valide = await bcrypt.compare("hunter2", hash) // true ou false
```

<!-- pause -->

> On ne renvoie jamais le hash au front — pas de `SELECT *` sur la table `users` si vous avez le hash dans une colonne

<!-- pause -->

> 📖 Pour aller plus loin : vous pouvez regarder comment fonctionne bcrypt, le "salt" (élément aléatoire), les "rainbow tables"

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 3
========

## Les deux approches d'authentification

<!-- end_slide -->

Deux grandes approches
=======================

<!-- pause -->

```mermaid +render
flowchart TD
    Q{"Front et back\nsur le même domaine ?"}
    Q -->|Oui| A["🍪 Cookies + Session"]
    Q -->|Non\ncross-domaine ou mobile| B["🔑 JWT / Bearer Token"]
    style A fill:#40a02b,color:#fff
    style B fill:#fe640b,color:#fff
```

<!-- pause -->

Les navigateurs **envoient automatiquement** les cookies sur les requêtes same-site (`SameSite`). Sur une requête d'un domaine à l'autre, ce comportement est la plupart du temps bloqué.

<!-- pause -->

Pareillement, sur **mobile**, il n'y a pas de navigateur → pas de gestion de cookies. Il faut gérer l'authentificatioon autrement.

<!-- end_slide -->

<!-- jump_to_middle -->

Branche 1
=========

## Cookies & Sessions

<!-- end_slide -->

Qu'est-ce qu'un cookie ?
=========================

Un cookie est un **petit fichier texte** stocké par le navigateur, associé à un domaine

Le serveur demande au navigateur de le stocker via un header :

```http
HTTP/1.1 200 OK
Set-Cookie: session_id=abc123xyz; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

<!-- pause -->

Le navigateur le renvoie **automatiquement** à chaque requête suivante :

```http
GET /profil HTTP/1.1
Cookie: session_id=abc123xyz
```

<!-- pause -->

> C'est le navigateur qui gère tout ça — pas votre code JavaScript

<!-- end_slide -->

Attributs d'un cookie
======================

<!-- incremental_lists: true -->

| Attribut | Effet |
|---|---|
| `HttpOnly` | **Inaccessible au JS** (`document.cookie`) — protège des attaques XSS |
| `Secure` | Transmis **uniquement en HTTPS** |
| `SameSite=Strict` | Envoyé **uniquement sur le même domaine** |
| `SameSite=Lax` | Autorise les navigations top-level (défaut moderne) |
| `SameSite=None` | Cross-domaine autorisé — **requiert `Secure`** |
| `Max-Age` / `Expires` | Durée de vie du cookie |

<!-- incremental_lists: false -->

<!-- pause -->

**Cookie HTTP vs Cookie JS**

```javascript
// Sans HttpOnly : accessible
document.cookie // "session_id=abc123xyz"

// Avec HttpOnly : invisible au JS
document.cookie // "" — mais envoyé automatiquement dans les requêtes HTTP
```

<!-- pause -->

> Un cookie `HttpOnly` est **visible dans les DevTools** (onglet Application)
> mais **inaccessible** à tout code JavaScript — le vôtre comme celui d'un attaquant

<!-- end_slide -->

Le mécanisme Session
=====================

Un cookie seul ne suffit pas — les données sensibles ne doivent pas voyager

```mermaid +render
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant N as Navigateur
    participant S as Serveur
    participant R as Mémoire / Redis / BDD

    U->>N: Login (email + mdp)
    N->>S: POST /login
    S->>S: Vérifie le mot de passe (bcrypt)
    S->>R: Crée session { userId: 42, role: "admin" }
    Note over R: Clé: "sess:abc123"
    S->>N: Set-Cookie: session_id=abc123 (signé, HttpOnly)
    N->>U: Connecté ✓

    Note over U,R: Requête suivante
    U->>N: Accède à /profil
    N->>S: GET /profil + Cookie: session_id=abc123
    S->>S: Vérifie la signature du cookie
    S->>R: Récupère session "sess:abc123"
    R->>S: { userId: 42, role: "admin" }
    S->>N: Réponse personnalisée
```

<!-- end_slide -->

Session : ce qui est stocké où
================================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Dans le cookie** (côté client)

```
session_id=abc123xyz.signature
```

- Juste un **identifiant** aléatoire
- Signé avec un secret serveur (HMAC)
- Si falsifié → signature invalide → rejeté

<!-- column: 1 -->

**En mémoire / Redis / BDD** (côté serveur)

```json
// à l'adresse abc123xyz
{
  "userId": 42,
  "role": "admin",
  "createdAt": "2025-03-24T10:00:00Z"
}
```

- Les vraies données
- Jamais exposées au client/front
- **Révocable** instantanément

<!-- reset_layout -->

<!-- pause -->

> **Pourquoi pas juste la mémoire du serveur ?**
> Au redémarrage ou au déploiement, la mémoire est vidée → tous les utilisateurs déconnectés
> Avec plusieurs serveurs, chacun a sa propre mémoire → selon le serveur qui répond, la session est introuvable
> → Solution : un stockage **externe** — Redis (cache) ou base de données (ex: Better Auth stocke les sessions dans Postgres)

<!-- end_slide -->

Expiration — Sessions
======================

Les sessions ont **deux niveaux d'expiration** :

<!-- pause -->

**Le cookie** (côté client)

```http
Set-Cookie: session_id=abc123; Max-Age=86400
```

Après expiration, le navigateur ne l'envoie plus

<!-- pause -->

**La session** (côté serveur)

```typescript
// Express + express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 86400000 }, // 24h
  // La session est invalidée côté serveur après 24h aussi
}))
```

<!-- pause -->

> Si le cookie expire **avant** la session → utilisateur déconnecté, session fantôme en mémoire
> Si la session expire **avant** le cookie → cookie arrivé mais rien côté serveur → rejeté
> Idéalement, les deux sont **alignés**

<!-- pause -->

La session peut être **révoquée manuellement** (déconnexion, changement de mdp) en la supprimant

<!-- end_slide -->

<!-- jump_to_middle -->

Branche 2
=========

## JWT / Bearer Token

<!-- end_slide -->

Pourquoi JWT ?
==============

Sur le même domaine → les cookies sont parfaits

Cross-domaine ou mobile → les cookies ne sont **pas envoyés automatiquement**

<!-- pause -->

Solution : donner au client/front un **token** qu'il gèrera lui-même et renverra explicitement

```http
GET /profil HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjQyfQ.xK9mN...
```

<!-- pause -->

C'est la convention **`Authorization: Bearer <token>`**

Très utilisée pour les **APIs** — après tout, une API c'est par définition cross-domaine

<!-- end_slide -->

Structure d'un JWT
==================

Un JWT est une chaîne en trois parties : `header.payload.signature`

```
eyJhbGciOiJIUzI1NiJ9 . eyJ1c2VySWQiOjQyfQ . xK9mNuQw3R...
      Header                  Payload             Signature
```

<!-- pause -->

Le payload est **encodé en Base64** — pas chiffré. N'importe qui peut le lire :

```json
{
  "userId": 42,
  "role": "admin",
  "exp": 1711276800
}
```

`exp` est un timestamp Unix — le serveur vérifie à chaque requête que le token n'a pas expiré

<!-- pause -->

> La **signature** fonctionne comme pour le cookie de session : le serveur signe le token avec son secret
> → Il peut vérifier que c'est bien **lui** qui l'a émis et que le payload n'a **pas été modifié**
> → Mais ça ne rend pas l'information secrète — **Ne jamais y mettre d'informations sensibles**
> 🔍 jwt.io — collez n'importe quel JWT pour voir son contenu en clair

<!-- end_slide -->

Où stocker un JWT ?
====================

`localStorage` est un espace de stockage **dans le navigateur**, propre à chaque site
Chaque domaine dispose du sien — `monsite.com` ne peut pas lire celui de `autresite.com`

```javascript
// Après le login — on stocke le token
const { token } = await res.json()
localStorage.setItem("token", token)

// Sur chaque requête — on le récupère et on l'envoie
const token = localStorage.getItem("token")
fetch("/api/profil", {
  headers: { Authorization: `Bearer ${token}` }
})

// À la déconnexion — ou quand le serveur répond 401 (token expiré)
localStorage.removeItem("token")
// → rediriger vers /login
```

<!-- pause -->

> `localStorage` survit au refresh et à la fermeture de l'onglet
> Contrairement aux cookies, **rien n'est envoyé automatiquement** — c'est le code qui gère tout
> Risque : accessible au JS → vulnérable aux attaques XSS

<!-- end_slide -->

Expiration d'un JWT
====================

Le JWT contient sa propre date d'expiration dans le payload :

```json
{
  "userId": 42,
  "exp": 1711276800
}
```

<!-- pause -->

Le serveur **vérifie `exp` à chaque requête** — si dépassé, token rejeté

<!-- pause -->

**Problème de révocation :**

Les JWT sont **stateless** — le serveur ne garde aucune trace

Si un token est volé, il reste valide jusqu'à son expiration

<!-- pause -->

> Solution : **courte durée de vie** (~15 minutes)
> Inconvénient : l'utilisateur doit se reconnecter souvent
> Compromis : les **Refresh Tokens**

<!-- pause -->

**Refresh Token en bref :**
- Access token court (~15min) + Refresh token long (~7j)
- Quand l'access token expire → le client échange le refresh token contre un nouveau
- La **rotation** invalide l'ancien refresh token à chaque usage → limite la fenêtre d'attaque

<!-- end_slide -->

Comparatif Sessions vs JWT
===========================

| | Sessions + Cookies | JWT / Bearer |
|---|---|---|
| **Stockage** | Serveur (Redis, BDD…) | Client (localStorage) |
| **Révocation** | ✅ Instantanée | ❌ Attendre l'expiration |
| **Scalabilité** | Stockage externe requis | ✅ Stateless |
| **Multi-domaine** | ❌ Bloqué par SameSite | ✅ Natif |
| **Mobile** | ❌ Pas de cookies auto | ✅ Header manuel |
| **Sécurité XSS** | ✅ HttpOnly | ❌ localStorage exposé |
| **Complexité** | Faible | Moyenne |
| **Cas typique** | App web monolithique | API, SPA cross-domaine, mobile |

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 4
========

## L'écosystème

<!-- end_slide -->

OAuth & SSO
============

Et si on ne voulait pas gérer les mots de passe du tout ?

<!-- pause -->

**OAuth / SSO** : on **délègue** l'authentification à un service tiers

```mermaid +render
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant A as Notre app
    participant G as Google / GitHub

    U->>A: "Se connecter avec Google"
    A->>G: Redirige vers Google
    G->>U: "Autorises-tu cette app ?"
    U->>G: Oui ✓
    G->>A: Code d'autorisation
    A->>G: Échange le code contre un token
    G->>A: Token + infos utilisateur (email, nom…)
    A->>A: Crée / retrouve l'utilisateur en base
    Note over A: On stocke l'email, jamais le mot de passe
    A->>U: Connecté ✓
```

<!-- pause -->

> On ne stocke **aucun mot de passe** — on fait confiance à Google/GitHub
> On récupère uniquement une **identité vérifiée**

<!-- end_slide -->

Better Auth — ouvrir la boîte noire
=====================================

Vous avez utilisé Better Auth hier — voyons ce qu'il fait vraiment

<!-- pause -->

Ouvrez les **DevTools** → onglet **Network** → faites un login

<!-- pause -->

Vous verrez :

<!-- incremental_lists: true -->

- Un `POST /api/auth/sign-in` avec email + mot de passe en body
- Dans la réponse : `Set-Cookie: better-auth.session_token=...`
- Sur les requêtes suivantes : `Cookie: better-auth.session_token=...`

<!-- incremental_lists: false -->

<!-- pause -->

Onglet **Application** → **Cookies** :

```
better-auth.session_token = abc123...
  HttpOnly ✓   Secure ✓   SameSite: Lax ✓
```

<!-- pause -->

> Better Auth utilise le mécanisme **Cookies + Session** qu'on vient de voir
> Il gère aussi OAuth si vous configurez des providers
> La "magie", c'est juste de l'HTTP qu'on connaît maintenant

<!-- end_slide -->

Récap — Les trois mécanismes cryptographiques
==============================================

<!-- pause -->

```mermaid +render
flowchart TD
    H["🔴 Hashing\nbcrypt, argon2"]
    S["🟡 Signature\nHMAC-SHA256"]
    E["🟢 Chiffrement\nAES, RSA"]

    H --> H1["Irréversible\nStockage de mots de passe"]
    S --> S1["Vérifiable, non-secret\nJWT, cookie de session"]
    E --> E1["Réversible avec clé\nHTTPS, JWE (rare)"]

    style H fill:#d20f39,color:#fff
    style S fill:#df8e1d,color:#fff
    style E fill:#40a02b,color:#fff
```

<!-- pause -->

| | Hash | Signature | Chiffrement |
|---|---|---|---|
| **Réversible ?** | ❌ | ❌ | ✅ (avec clé) |
| **Contenu lisible ?** | Non (empreinte) | ✅ Oui | ❌ Non |
| **Garantit** | Intégrité du mdp | Authenticité | Confidentialité |
| **Utilisé pour** | Mots de passe | JWT, cookies | HTTPS, données sensibles |

<!-- end_slide -->

<!-- jump_to_middle -->

En résumé
=========

<!-- end_slide -->

Ce qu'on a vu
==============

<!-- incremental_lists: true -->

- HTTP est **stateless** — chaque requête est isolée, sans fil conducteur
- On ne fait **jamais confiance au front** pour s'auto-identifier
- Les mots de passe sont **hashés** (bcrypt) — jamais stockés en clair
- **Cookies + Session** : stockage serveur, révocation instantanée, same-site
- **JWT / Bearer** : stateless, cross-domaine, mobile, révocation difficile
- Le choix dépend de votre architecture — **pas de solution universelle**
- **OAuth** délègue l'authentification — on ne gère pas les mots de passe
- Better Auth fait tout ça pour vous — maintenant vous savez ce qu'il y a dedans

<!-- incremental_lists: false -->

<!-- end_slide -->
