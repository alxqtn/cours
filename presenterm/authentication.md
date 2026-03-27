---
title: "**Authentification**"
sub_title: "Comment ça marche vraiment"
theme:
  name: catppuccin-latte
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

## Cookies ou pas?

<!-- end_slide -->

Comment passer l'information entre le back et le front
=======================

<!-- pause -->

```mermaid +render
flowchart TD
    Q{"Front et back\nsur le même domaine ?"}
    Q -->|Oui| A["🍪 Cookies"]
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

Quand c'est possible
=========

## Cookies

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

Cookie — signé avec un secret serveur
======================================

Le navigateur renvoie le cookie tel quel — comment le serveur sait-il qu'il l'a bien émis ?

<!-- pause -->

Il **signe** la valeur avec son secret (HMAC) avant de l'envoyer :

```http
Set-Cookie: session_id=abc123xyz.f7a3b2c1d4e5...
```

Après le `.` → une **signature** calculée par le serveur avec son secret

<!-- pause -->

Quand le navigateur renvoie le cookie, le serveur :
1. Recalcule la signature sur `abc123xyz` avec son secret
2. Compare avec celle reçue — si elles ne correspondent pas, la requête est rejetée

<!-- pause -->

> Le secret ne quitte jamais le serveur
> Sans lui, impossible de forger une signature valide → impossible de se faire passer pour quelqu'un d'autre

<!-- end_slide -->

<!-- jump_to_middle -->

L'alternative fréquente
=======================

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

<!-- jump_to_middle -->

Partie 4 / La session
======================

<!-- end_slide -->

Que contient le token ou le cookie ?
=====================================

**Le réflexe** — on y met directement l'identifiant utilisateur

```json
{ "userId": 42, "role": "admin", "exp": 1711276800 }
```

- ✅ Rien à stocker côté serveur
- ✅ Signé → impossible à forger
- ❌ Contient une vraie info si intercepté (`userId` = vraie ressource dans le système)
- ❌ Presque impossible à révoquer → l'expiration doit être courte

<!-- pause -->

**La session** — on y met un identifiant de session

```json
{ "sessionId": "abc123" }
```

L'ID est aléatoire — sans les données côté serveur (mémoire, BDD, Redis), il ne signifie rien

- ❌ Nécessite de stocker dans une table ou un cache
- ✅ Révocable instantanément
- ✅ Les données ne voyagent jamais

<!-- pause -->

> Avec les **cookies** → presque toujours avec session (Express Session, Better Auth)
> Avec le **bearer/JWT** → moins systématique, mais possible — Better Auth le fait

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
    participant R as Mémoire / BDD / Redis

    U->>N: Login (email + mdp)
    N->>S: POST /login
    S->>S: Vérifie le mot de passe (bcrypt)
    S->>R: Crée session { userId: 42, role: "admin" }
    Note over R: Clé: "sess:abc123"
    S->>N: Set-Cookie: session_id=abc123.signature
    N->>U: Connecté ✓

    Note over U,R: Requête suivante
    U->>N: Accède à /profil
    N->>S: GET /profil + Cookie: session_id=abc123.signature
    S->>S: Vérifie la signature
    S->>R: Récupère session "sess:abc123"
    R->>S: { userId: 42, role: "admin" }
    S->>N: Réponse personnalisée
```

<!-- end_slide -->

Session : ce qui est stocké où
================================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Dans le token** (côté client)

```
session_id=abc123xyz.signature
```

- Juste un **identifiant** aléatoire
- Signé avec un secret serveur (HMAC)
- Si falsifié → signature invalide → rejeté

<!-- column: 1 -->

**Dans la session** (côté serveur)

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

**Stocker la session en mémoire ?**

C'est suffisant sur un environnement local, mais en pratique :

- Au redémarrage ou au re-déploiement, la mémoire est vidée → tous les utilisateurs déconnectés
- Avec plusieurs serveurs, chacun a sa propre mémoire → selon le serveur qui répond, la session est introuvable

→ Solution : un stockage **externe** — base de données (ex: Better Auth stocke les sessions dans Postgres) ou Redis (plus rapide, quand c'est important)

<!-- end_slide -->

Expiration et révocation
=========================

Les tokens ont une **durée de vie** — définie à la création

<!-- pause -->

## Sans les sessions

Dans le payload JWT (`exp`) ou le `Expires/Max-Age` du cookie

- Délai dépassé: Le serveur rejette le token JWT, le cookie "disparaît"
- Presque impossible à révoquer avant : si volé, il reste valide jusqu'à expiration

<!-- pause -->

## Avec une **session**

Expiration côté serveur + durée de vie du token/cookie

- Les deux devraient être alignés. Si un seul des deux a expiré, déconnexion
- Révocable à tout moment — déconnexion, changement de mot de passe, token compromis

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 5
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

Alternatives à Better Auth
============================

Plusieurs approches existent selon vos besoins :

<!-- pause -->

## 1. Faire soi-même

Implémenter avec `bcrypt` + cookies/JWT directement pour mieux retenir comment ça marche, mais c'est long la premières fois.

<!-- pause -->

## 2. Bibliothèque

Des librairies similaires à **Better Auth**: Auth.js, Lucia, Supabase Auth (si vous utilisez déjà Supabase).

<!-- pause -->

## 3. Service managé — le plus rapide à mettre en place

**Clerk / Kinde** — Un service externe qui s'occupe de tout : UI de connexion, base de données, emails…

Trade-off : payant à partir d'un certain usage (~10-50k utilisateurs), dépendance externe

<!-- end_slide -->

Récap — mécanismes cryptographiques vus dans ce cours
=======================================================

<!-- pause -->

```mermaid +render
flowchart TD
    E["🟢 Chiffrement\nAES, RSA"]
    H["🔴 Hashing\nbcrypt, argon2"]
    S["🟡 Signature\nHMAC-SHA256"]

    E --> E1["✅ Réversible avec clé\nGarantit la confidentialité\nHTTPS"]
    H --> H1["❌ Irréversible\nGarantit l'intégrité\nStockage de mots de passe"]
    S --> S1["Lisible, signé via un secret\nGarantit l'authenticité\nJWT, cookies de session"]

    style E fill:#40a02b,color:#fff
    style H fill:#d20f39,color:#fff
    style S fill:#df8e1d,color:#fff
```

<!-- end_slide -->

Ce qu'on a vu
==============

<!-- incremental_lists: true -->

- On ne fait **jamais confiance au front** pour l'identité, on lui demande de nous renvoyer l'information "signée"
- Les mots de passe sont **hashés** (bcrypt) — jamais stockés en clair
- Le **transport** du token : cookie (automatique, same-site) ou header Authorization (manuel, cross-domaine, mobile)
- Le **contenu** du token : userId directement (pas de stockage serveur, mais difficile à révoquer) ou ID de session (révocable, données côté serveur)
- **OAuth** délègue l'authentification — on ne gère pas les mots de passe ou la vérification d'identité en général
- Better Auth fait tout ça pour vous — maintenant vous savez ce qu'il y a dedans

<!-- incremental_lists: false -->
