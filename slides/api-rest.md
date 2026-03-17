---
author: Cours
date: MMMM dd, YYYY
paging: "%d / %d"
---

# APIs REST

**Comprendre, modéliser et utiliser les APIs web**

1. Qu'est-ce qu'une API ?
2. APIs web / HTTP
3. REST & les contraintes RESTful

---

## Qu'est-ce qu'une API ?

**API** = *Application Programming Interface*

Une interface qui permet à **du code de communiquer avec d'autre code**.

> Analogie : une prise électrique est une API. Peu importe ce que vous
> branchez, l'interface (les trous) définit le contrat. Vous n'avez pas
> besoin de savoir comment l'électricité est produite.

### Le mot clé : contrat

Une API définit :

- **quoi appeler** (une fonction, une URL…)
- **avec quels paramètres**
- **ce qu'on obtient en retour**

Elle **cache l'implémentation** derrière une interface stable.

---

## API : un terme qui désigne beaucoup de choses

### API de langage / runtime

- `Array.prototype.map()` — l'API des tableaux JS
- Le DOM (`getElementById`, `addEventListener`) — API du navigateur
- `fs.readFile()` — API Node.js pour le système de fichiers

### API de bibliothèque / framework

- React : `useState`, `useEffect` — API de React
- Express : `app.get()`, `app.use()` — API d'Express
- N'importe quelle lib npm expose une API publique

### API système / OS

- Les syscalls Linux (`open`, `read`, `write`…)
- Win32, Cocoa…

### API web / réseau ← *c'est ça qu'on va étudier*

- Une API HTTP/REST, GraphQL, gRPC, WebSocket…

---

## Les APIs web / HTTP

Une API web = une API accessible **via le réseau**, par-dessus le protocole **HTTP**.

### Requête (client → serveur)

```
Méthode  :  GET, POST, PUT, DELETE…
URL      :  /api/users/42
Headers  :  Content-Type, Authorization…
Body     :  JSON, form-data… (optionnel)
```

### Réponse (serveur → client)

```
Status   :  200, 201, 404, 500…
Headers  :  Content-Type, Cache-Control…
Body     :  JSON, HTML, texte… (optionnel)
```

### Quelques types d'APIs web

`REST` · `GraphQL` · `gRPC` · `WebSocket` · `SOAP`

---

## Les méthodes HTTP (verbes)

| Méthode   | Description                                  | Idempotent |
|-----------|----------------------------------------------|------------|
| `GET`     | Lire une ressource (sans effet de bord)       | ✓          |
| `POST`    | Créer une ressource (ou déclencher une action)| ✗          |
| `PUT`     | Remplacer une ressource entière               | ✓          |
| `PATCH`   | Modifier partiellement une ressource          | ✗          |
| `DELETE`  | Supprimer une ressource                       | ✓          |
| `HEAD`    | Comme GET mais sans body en réponse           | ✓          |
| `OPTIONS` | Méthodes autorisées — preflight CORS          | ✓          |

> **Idempotent** = appeler la même requête plusieurs fois donne le même
> résultat qu'une seule fois.

---

## Les status codes HTTP

### 2xx — Succès

- `200 OK` · `201 Created` · `204 No Content`

### 3xx — Redirection

- `301 Moved Permanently` · `304 Not Modified`

### 4xx — Erreur client

- `400 Bad Request` · `401 Unauthorized` · `403 Forbidden`
- `404 Not Found` · `422 Unprocessable Entity` · `429 Too Many Requests`

### 5xx — Erreur serveur

- `500 Internal Server Error` · `502 Bad Gateway` · `503 Service Unavailable`

> Les 4xx, c'est **votre** faute. Les 5xx, c'est **leur** faute.

---

## Qu'est-ce que REST ?

**REST** = *REpresentational State Transfer*

Pas un protocole, pas une lib — un **style architectural** défini en 2000
par Roy Fielding dans sa thèse de doctorat sur l'architecture du web.

### REST vs RESTful

- **REST** = l'ensemble des contraintes architecturales
- **RESTful** = une API qui respecte (ou prétend respecter) ces contraintes

> En pratique, la plupart des "APIs REST" ne sont que partiellement RESTful.
> Ce n'est pas grave.

### L'idée centrale : les ressources

Tout est une **ressource** (un utilisateur, un article, une commande…).
Chaque ressource a une **URL unique**. On agit dessus avec les **verbes HTTP**.

```
GET    /users         → liste d'utilisateurs
GET    /users/42      → utilisateur 42
POST   /users         → créer un utilisateur
PUT    /users/42      → remplacer l'utilisateur 42
DELETE /users/42      → supprimer l'utilisateur 42
```

---

## Les 6 contraintes REST (1/2)

### 1. Client-Serveur

Séparation stricte entre client et serveur.

- Le client ne sait rien de la BDD
- Le serveur ne sait rien de l'UI
- → Ils évoluent **indépendamment**

### 2. Sans état — Stateless

Chaque requête est **indépendante et auto-suffisante**.

- Le serveur ne garde pas de session entre deux requêtes
- Tout le contexte nécessaire est dans la requête (ex: token JWT)
- → Scalabilité horizontale facilitée

### 3. Cache

Les réponses doivent indiquer si elles sont **cachables**.

- Via les headers HTTP : `Cache-Control`, `ETag`, `Last-Modified`…
- → Réduction de la charge serveur, latence réduite

---

## Les 6 contraintes REST (2/2)

### 4. Interface Uniforme

L'interface entre client et serveur est **standardisée**.

- Identification des ressources par URI
- Manipulation via représentations (JSON, XML…)
- Messages auto-descriptifs (`Content-Type`, `Accept`…)
- HATEOAS (voir slide suivant)

### 5. Système en couches — Layered

Le client ne sait pas s'il parle **directement** au serveur.

- Des proxies, load balancers, caches peuvent être intercalés
- → Transparence et flexibilité d'infrastructure

### 6. Code à la demande *(optionnel)*

Le serveur peut envoyer du **code exécutable** au client.

- Ex : du JavaScript dans une réponse HTML
- La seule contrainte optionnelle — rarement utilisée en APIs JSON

---

## Nommage des URLs RESTful

### ✗ Noms, pas verbes — les verbes sont dans la méthode HTTP

```
✗  /getUsers
✗  /createUser
✓  /users
✓  /users/42
```

### Pluriel pour les collections

```
✓  /users          (collection)
✓  /users/42       (item)
✗  /user/42
```

### Hiérarchie logique

```
✓  /users/42/posts
✓  /users/42/posts/7
~  /posts?userId=42   (acceptable mais moins expressif)
```

### Minuscules et tirets

```
✓  /blog-posts
✗  /blogPosts
✗  /blog_posts
```

---

## HATEOAS — le niveau ultime (souvent ignoré)

**Hypermedia As The Engine Of Application State**

Une API vraiment RESTful retourne non seulement les données,
mais aussi les **liens vers les actions disponibles**.

```json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "_links": {
    "self":   { "href": "/users/42" },
    "posts":  { "href": "/users/42/posts" },
    "delete": { "href": "/users/42", "method": "DELETE" }
  }
}
```

> HATEOAS est la contrainte la moins respectée en pratique.
> La plupart des APIs dites "REST" ne l'implémentent pas.
> Ce n'est pas un défaut en soi — c'est un choix de pragmatisme.
> Fielding, lui, insiste dessus.

---

## Récapitulatif

### API en général

- Interface permettant à du code de communiquer avec d'autre code
- Existe à tous les niveaux : langage, lib, OS, réseau…
- Toujours un contrat : quoi appeler, avec quoi, qu'est-ce qu'on reçoit

### APIs web / HTTP

- API accessible via réseau, par-dessus HTTP
- Requête = méthode + URL + headers + body optionnel
- Réponse = status code + headers + body optionnel

### REST / RESTful

- Style architectural (pas un protocole) — thèse Fielding 2000
- 6 contraintes : client-serveur, stateless, cache, interface uniforme,
  layered, code-on-demand
- En pratique : URLs qui nomment des ressources, verbes HTTP, JSON
