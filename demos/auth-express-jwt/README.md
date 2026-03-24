# Authentification JWT avec Express

Projet pédagogique montrant comment implémenter une authentification basée sur JWT dans un serveur Express avec TypeScript.

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm start

# Ou avec rechargement automatique en développement
npm run dev
```

Le serveur tourne sur `http://localhost:3000` par défaut.

## Ce que ce projet démontre

### 1. Hachage des mots de passe

On ne stocke **jamais** les mots de passe en clair. On utilise bcrypt pour les hacher :

```typescript
// À l'inscription : hacher le mot de passe avant de le stocker
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

// À la connexion : comparer le mot de passe fourni avec le hash stocké
const passwordMatch = await bcrypt.compare(password, user.password_hash);
```

bcrypt gère automatiquement le salage (ajout de données aléatoires pour empêcher les attaques par rainbow table).

### 2. JWT (JSON Web Tokens)

Après une connexion réussie, on crée un token contenant l'ID de l'utilisateur :

```typescript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
  expiresIn: "24h",
});
```

Le token est :
- **Signé** : le serveur peut vérifier qu'il n'a pas été modifié
- **Auto-contenu** : contient l'ID utilisateur, donc pas besoin de requête en base pour savoir qui fait la requête
- **Stateless** : le serveur ne stocke pas de sessions - tout est dans le token

### 3. Authentification vs Autorisation

- **Authentification** : "Qui êtes-vous ?" → Vérifier l'identité via la connexion
- **Autorisation** : "Avez-vous le droit de faire ça ?" → Vérifier les permissions

Exemple dans ce projet :
- Login = Authentification (prouver que vous êtes bien qui vous prétendez être)
- Supprimer un utilisateur = Autorisation (vérifier que vous supprimez VOTRE compte, pas celui de quelqu'un d'autre)

### 4. Middlewares d'authentification

#### `parseToken` (global)
Appliqué à toutes les routes via `app.use(parseToken)`. Parse le token JWT s'il est présent et définit `req.userId`. Si un token est fourni mais invalide ou expiré, renvoie une erreur 401.

#### `requireAuth`
Ajouté aux routes qui nécessitent un utilisateur connecté. Vérifie simplement que `req.userId` est défini, sinon renvoie 401.

## Endpoints de l'API

### Endpoints publics

#### `GET /`
Health check - retourne le statut du serveur.

#### `POST /signup`
Créer un nouveau compte.

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### `POST /login`
S'authentifier et recevoir un token JWT.

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Réponse :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "johndoe", ... }
}
```

### Endpoints protégés

Envoyer le token dans le header `Authorization` :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### `GET /users/:id`
Récupérer un profil utilisateur. Fonctionne sans auth, mais montre plus d'infos si c'est votre profil.

#### `PUT /users/:id`
Modifier votre profil. Requiert auth + doit être votre compte.

#### `DELETE /users/:id`
Supprimer votre compte. Requiert auth + doit être votre compte.

## Intégration Frontend

Voici comment intégrer l'authentification dans une application frontend :

### 1. Connexion et stockage du token

```javascript
async function login(email, password) {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();

  // Stocker le token dans localStorage
  localStorage.setItem('token', data.token);
  return data;
}
```

### 3. Faire des requêtes authentifiées

```javascript
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Ajouter le header Authorization si on a un token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Gérer l'expiration du token
  if (response.status === 401) {
    // Token expiré ou invalide - vider le storage et rediriger vers login
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }

  return response;
}

// Utilisation
const response = await fetchWithAuth('http://localhost:3000/users/1');
const user = await response.json();
```

### 4. Déconnexion

On "oublie" simplement le token côté client :

```javascript
function logout() {
  localStorage.removeItem('token');
  // Rediriger vers l'accueil ou la page de connexion
  window.location.href = '/';
}
```

### 5. Vérifier si l'utilisateur est connecté

```javascript
function isLoggedIn() {
  const token = localStorage.getItem('token');
  if (!token) return false;
}
```

## Notes importantes sur la sécurité

### Pourquoi pas d'endpoint de déconnexion ?

Les JWT sont **stateless** - le serveur ne garde pas trace des sessions actives. Cela signifie :
- ✅ Simple et scalable - pas besoin de stockage de sessions
- ❌ Impossible de vraiment "invalider" un token avant son expiration

Le token reste valide jusqu'à son expiration, même après une "déconnexion". Pour la plupart des applications, c'est acceptable. Pour des besoins de sécurité plus élevés, il faudrait implémenter :
- Des tokens à courte durée de vie avec des refresh tokens
- Ou utiliser des sessions côté serveur traditionnelles plutôt que des JWT

### Checklist production

Avant de déployer en production :
- [ ] Utiliser un `JWT_SECRET` fort et unique (pas celui par défaut !)
- [ ] Utiliser HTTPS
- [ ] Utiliser une base de données sur fichier (ou réseau comme PG, MySQL)
- [ ] Ajouter de la validation/sanitization des inputs
- [ ] Utiliser des variables d'environnement pour tous les secrets
