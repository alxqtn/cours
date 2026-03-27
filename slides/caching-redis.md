---
title: "Redis & le **Caching**"
sub_title: "Pourquoi, quand, et comment"
author: Alix
theme:
  name: catppuccin-mocha
---

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 1 — Pourquoi cacher ?
=============================

<!-- end_slide -->

C'est quoi le caching ?
=======================

<!-- pause -->


**Cacher** = sauvegarder le résultat d'une opération pour ne pas la refaire.

<!-- pause -->

C'est tout.

<!-- pause -->

```
Opération coûteuse  →  résultat  →  on le garde quelque part
                                           ↓
                              prochaine fois : on réutilise
```

<!-- pause -->

Exemples d'opérations qu'on ne veut pas refaire à chaque fois :

<!-- incremental_lists: true -->

- Géocoder une adresse (récupérer lat/long depuis "12 rue de Rivoli, Paris")
- Calculer les stats d'un dashboard (nombre de ventes, CA du mois…)

<!-- incremental_lists: false -->

<!-- pause -->

> Le cache peut être une simple **variable**, ou ça peut être sauvegardé dans un fichier. Le principal c'est que ce soit significativement plus rapide de la récupérer là où elle est que de relancer l'opération.

<!-- end_slide -->

Le problème
===========

Tu as une app. Un utilisateur charge une page.

<!-- pause -->

Voilà ce qui se passe :

```
Navigateur → Serveur → Base de données
                            ↓
                       (quelque part dans un datacenter)
                            ↓
                       Serveur → Navigateur
```

<!-- pause -->

La BDD n'est **pas sur ta machine**. C'est un appel **réseau**.

<!-- pause -->

⏱️ Ça peut prendre **50ms, 200ms, parfois 500ms.**

<!-- end_slide -->

La charge
=========

Maintenant imagine 10 000 utilisateurs qui chargent **la même page d'accueil** en même temps.

<!-- pause -->

→ **10 000 requêtes identiques** envoyées à ta base de données.

<!-- pause -->

→ Le résultat est **le même pour tout le monde.**

<!-- pause -->

→ C'est du **gaspillage pur.**

<!-- speaker_note: Insister sur l'idée que la BDD n'est pas infiniment scalable. C'est une ressource partagée qui peut saturer. -->

<!-- end_slide -->

La solution : le cache
======================

L'idée : **calculer une fois, servir mille fois.**

<!-- pause -->

```
Première requête  →  BDD  →  on stocke le résultat
Requêtes suivantes  →  résultat instantané (sans toucher la BDD)
```

<!-- pause -->

Le résultat est gardé pendant un certain temps : le **TTL** *(Time To Live)*.

<!-- pause -->

> Exemple : la page d'accueil du Monde est recalculée toutes les 10 minutes.
> Un nouvel article n'apparaît pas instantanément — **et c'est ok.**

<!-- end_slide -->

Les trois niveaux de cache
==========================

<!-- column_layout: [1, 1, 1] -->

<!-- column: 0 -->

**🌐 Cache navigateur**
*(HTTP headers)*

Stocké dans le navigateur de l'utilisateur.

Protège *l'utilisateur* — évite qu'il retélécharge les mêmes ressources.

Ne réduit pas la charge serveur globale.

<!-- column: 1 -->

**⚙️ Cache in-process**

Une variable en mémoire dans ton serveur Node.js.

Rapide. Mais si tu as **plusieurs instances** du serveur → elles ont chacune leur propre cache. Elles se désynchronisent.

<!-- column: 2 -->

**🔴 Cache distribué**
*(Redis)*

Un serveur de cache **séparé**, accessible par toutes tes instances.

Tout le monde lit et écrit **au même endroit**.

<!-- reset_layout -->

<!-- end_slide -->

Quand cacher ?
==============

Deux questions à se poser :

<!-- pause -->

1. **Est-ce que tout le monde voit la même chose ?**
2. **Est-ce qu'un léger décalage est acceptable ?**

<!-- pause -->

✅ **Oui au cache**

| Cas                            | Pourquoi                       |
|--------------------------------|--------------------------------|
| Page d'accueil d'un magazine   | Même contenu, fort trafic      |
| Météo du jour                  | Données stables quelques min   |
| Profil public d'un utilisateur | Rarement mis à jour            |
| Catalogue produits             | Peu de changements             |

<!-- pause -->

❌ **Non au cache**

| Cas                            | Pourquoi                       |
|--------------------------------|--------------------------------|
| Feed Instagram/TikTok          | Personnalisé, temps réel       |
| Panier d'un utilisateur        | Propre à chacun, critique      |
| Score en direct d'un match     | L'intérêt c'est le live        |
| Cours d'une action en bourse   | La seconde compte              |

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 2 — Redis
================

<!-- end_slide -->

C'est quoi Redis ?
==================

**Redis n'est pas vraiment une base de données.**

<!-- pause -->

Enfin… pas au sens classique du terme.

<!-- pause -->

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Postgres, MySQL…**

- Stockent sur **disque**
- Source de vérité
- Données persistantes
- Relationnelles, schéma structuré

<!-- column: 1 -->

**Redis**

- Stocke en **RAM**
- Données temporaires / éphémères
- Pas de schéma, pas de tables
- Clé → valeur

<!-- reset_layout -->

<!-- pause -->

> Redis est un **serveur de structures de données en mémoire**.
> On l'utilise *en plus* d'une BDD, pas à la place.

<!-- end_slide -->

Pourquoi c'est rapide ?
=======================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Le disque** *(Postgres)*

C'est ton armoire.

Tu dois te lever, ouvrir, chercher, revenir.

→ ~1ms à plusieurs ms par lecture

<!-- column: 1 -->

**La RAM** *(Redis)*

C'est ton bureau.

Tout ce qui est dessus est accessible **immédiatement**.

→ < 1ms, souvent en microsecondes

<!-- reset_layout -->

<!-- pause -->

La RAM c'est **100 à 1000x plus rapide** que le disque.

<!-- end_slide -->

Les structures de données
=========================

Redis n'est pas juste un dictionnaire. Il comprend plusieurs types de valeurs :

<!-- incremental_lists: true -->

- **String** — la valeur la plus simple. Texte, JSON sérialisé, HTML entier d'une page…
- **Hash** — un objet clé/valeur imbriqué. Parfait pour une session utilisateur.
- **List** — une liste ordonnée. Files d'attente, historiques.
- **Set** — ensemble sans doublons. Tags, membres uniques.
- **Sorted Set** — ensemble ordonné par score. Leaderboards.

<!-- incremental_lists: false -->

<!-- pause -->

Pour le caching, on utilise **surtout les Strings**.

<!-- end_slide -->

<!-- jump_to_middle -->

🖥️ Démo — Redis CLI
====================

<!-- speaker_note: Ouvrir un terminal. Lancer redis-cli. Exécuter les commandes suivantes une par une en commentant. -->

<!-- end_slide -->

Démo : les bases
================

```bash
# Se connecter
redis-cli

# Stocker une valeur
SET user:42 "Alice"

# Lire
GET user:42

# Stocker avec TTL (30 secondes)
SETEX page:home 30 "<html>Page d'accueil...</html>"

# Voir le TTL restant
TTL page:home

# Attendre... et re-vérifier
TTL page:home

# La clé a disparu toute seule
GET page:home
```

<!-- speaker_note: Bien insister sur le TTL qui disparaît tout seul — c'est magique pour les étudiants. Montrer que GET renvoie (nil) après expiration. -->

<!-- end_slide -->

Démo : Hash et compteur
=======================

```bash
# Stocker un objet (Hash)
HSET session:abc123 userId 42 role "admin"
HGETALL session:abc123

# Incrémenter un compteur (atomique !)
INCR ratelimit:192.168.1.1
INCR ratelimit:192.168.1.1
INCR ratelimit:192.168.1.1
GET ratelimit:192.168.1.1

# Expiration sur le compteur
EXPIRE ratelimit:192.168.1.1 60
TTL ratelimit:192.168.1.1

# Voir toutes les clés (⚠️ jamais en prod !)
KEYS *

# Supprimer
DEL user:42
```

<!-- end_slide -->

Convention de nommage
=====================

Les clés Redis sont de simples strings. Il faut une **convention** pour s'y retrouver.

<!-- pause -->

Le standard : `resource:identifiant`

```
user:42
user:42:preferences
session:abc123
page:home
ratelimit:192.168.1.1
article:slug:redis-intro
```

<!-- pause -->

> ✅ Lisible, prévisible, facile à invalider par pattern.

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 3 — Comment ça marche
=============================

<!-- end_slide -->

Le pattern Cache-Aside
======================

*(aussi appelé lazy loading)*

C'est le pattern le plus courant. Le principe :

> On ne charge dans le cache que ce qui est demandé.

<!-- pause -->

```
Requête arrive
      ↓
  Redis : est-ce que j'ai la réponse ?
      ↓
  ┌── OUI (hit) ──→ on retourne directement ⚡
  │
  └── NON (miss) ──→ on va en BDD
                          ↓
                    on stocke dans Redis (avec TTL)
                          ↓
                    on retourne la réponse
```

<!-- end_slide -->

Cache-Aside : en code
=====================

```typescript
async function getArticle(slug: string) {
  // 1. On regarde dans le cache
  const cached = await redis.get(`article:${slug}`)

  if (cached) {
    return JSON.parse(cached) // ⚡ cache hit
  }

  // 2. Cache miss → on va en BDD
  const article = await db.query(
    'SELECT * FROM articles WHERE slug = $1',
    [slug]
  )

  // 3. On stocke pour les prochaines requêtes (TTL : 10 min)
  await redis.setEx(`article:${slug}`, 600, JSON.stringify(article))

  return article
}
```

<!-- speaker_note: Insister sur le JSON.stringify/parse — Redis stocke des strings. Pas d'objets natifs. -->

<!-- end_slide -->

L'invalidation
==============

Le problème : si l'article est **mis à jour**, le cache contient encore l'ancienne version.

<!-- pause -->

Solutions :

<!-- incremental_lists: true -->

- **Attendre le TTL** — simple, mais l'utilisateur voit des données périmées jusqu'à expiration
- **Supprimer la clé manuellement** — quand tu mets à jour en BDD, tu fais aussi `DEL article:slug`
- **TTL court** — compromis : accepter X minutes de décalage

<!-- incremental_lists: false -->

<!-- pause -->

> *"There are only two hard things in computer science: cache invalidation and naming things."*
> — Phil Karlton

<!-- end_slide -->

<!-- jump_to_middle -->

Partie 4 — Cas d'usage avancés
================================

<!-- end_slide -->

Ce qu'on stocke dans Redis
==========================

Redis brille pour les données qui **ne rentrent pas naturellement dans une table** :

<!-- incremental_lists: true -->

- Le HTML d'une page entière pré-rendue → une String
- Un compteur de visites → une valeur numérique
- Un token de session → existe le temps de la session
- Un résultat de calcul coûteux → existe le temps qu'il est valide
- Un flag de rate limiting par IP → existe 60 secondes, puis disparaît

<!-- incremental_lists: false -->

<!-- pause -->

Ce qui les unit : **durée de vie limitée, valeur unique, partagée entre instances, pas besoin de schéma.**

<!-- end_slide -->

Sessions utilisateur
====================

Comment Redis s'insère dans le flux d'authentification :

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**À la connexion**

```
1. User envoie login + password
2. Serveur vérifie en BDD ✓
3. Serveur crée un token aléatoire
   ex: "abc123"
4. Stocke dans Redis :
   session:abc123 → { userId: 42 }
   TTL: 24h
5. Envoie le token au client
   (dans un cookie)
```

<!-- column: 1 -->

**À chaque requête suivante**

```
1. Client envoie le cookie "abc123"
2. Serveur fait :
   GET session:abc123
3. Redis répond en < 1ms
4. Serveur sait qui est l'user ✓

Si la clé n'existe plus
(TTL expiré) → session invalide
→ redirect login
```

<!-- reset_layout -->

<!-- pause -->

> Sans Redis : soit aller en BDD à chaque requête (lent), soit garder en mémoire locale (casse au scaling).

<!-- end_slide -->

Rate Limiting
=============

**Objectif** : limiter à 100 requêtes/minute par IP.

<!-- pause -->

```bash
# À chaque requête entrante :
INCR ratelimit:192.168.1.1
EXPIRE ratelimit:192.168.1.1 60   # reset dans 60s

# Si la valeur > 100 → on bloque
```

<!-- pause -->

Pourquoi Redis est parfait pour ça :

<!-- incremental_lists: true -->

- `INCR` est **atomique** — pas de race condition entre deux requêtes simultanées
- Le TTL gère la **fenêtre de temps automatiquement** — pas besoin de cron job
- La clé **disparaît toute seule** après 60s — compteur remis à zéro

<!-- incremental_lists: false -->

<!-- pause -->

Avec une BDD SQL, il faudrait une table, des requêtes de lecture/écriture, un job de nettoyage… 😅

<!-- end_slide -->

Pub/Sub
=======

Redis permet à des parties de ton système de **communiquer sans se connaître**.

<!-- pause -->

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Le problème avec SQL**

Pour "écouter" des nouveaux événements, il faudrait **poller** :

```
while (true) {
  SELECT * FROM events
  WHERE seen = false
  SLEEP 1s
}
```

Lent. Charge la BDD. Pas du vrai temps réel.

<!-- column: 1 -->

**Avec Redis Pub/Sub**

```bash
# Service A publie
PUBLISH commandes:new '{"id": 42}'

# Service B écoute (push instantané)
SUBSCRIBE commandes:new
```

Dès qu'un message est publié, tous les abonnés le reçoivent **immédiatement**.

<!-- reset_layout -->

<!-- pause -->

> Redis Pub/Sub est léger et simple. Pour des millions d'événements en prod → Kafka. Mais pour démarrer, Redis suffit largement.

<!-- end_slide -->

Leaderboards avec Sorted Sets
==============================

**Objectif** : afficher le top 10 des joueurs en temps réel.

<!-- pause -->

Avec SQL : `SELECT user_id, SUM(score) FROM scores GROUP BY user_id ORDER BY SUM(score) DESC LIMIT 10`

→ Coûteux à recalculer sous charge.

<!-- pause -->

Avec Redis :

```bash
# Ajouter / mettre à jour un score
ZADD leaderboard 1500 "user:42"
ZADD leaderboard 2300 "user:17"
ZADD leaderboard 980  "user:8"

# Top 3 (du plus haut au plus bas)
ZREVRANGE leaderboard 0 2 WITHSCORES
```

<!-- pause -->

Redis maintient l'ordre **automatiquement** à chaque insertion. Lecture instantanée. ⚡

<!-- end_slide -->

<!-- jump_to_middle -->

Récap
=====

<!-- end_slide -->

Ce qu'on a vu
=============

<!-- incremental_lists: true -->

- Le **cache** : calculer une fois, servir mille fois
- **TTL** : durée de vie d'une valeur en cache
- **Redis** : serveur de structures de données in-memory, ultra-rapide
- Le pattern **cache-aside** : le plus courant, lazy loading
- **Sessions** : Redis comme store partagé entre instances
- **Rate limiting** : compteur atomique avec expiration automatique
- **Pub/Sub** : communication temps réel entre services
- **Sorted Sets** : leaderboards sans recalcul

<!-- incremental_lists: false -->
