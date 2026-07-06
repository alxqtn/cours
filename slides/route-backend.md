---
title: Comprendre une **fonctionnalité backend**
sub_title: "Semaine 7 · l'inscription d'un·e utilisateur·ice"
author: Ada Tech School
theme:
  name: light
---

<!-- jump_to_middle -->

# Quand une personne crée un compte, qu'est-ce qui se passe **côté backend** ?

<!-- end_slide -->

## Ce qu'un contrôleur enchaîne

<!-- incremental_lists: true -->

1. **recevoir** la requête
2. **lire** les données envoyées
3. **valider** les champs
4. vérifier les **règles métier**
5. **transformer** ce qui doit l'être
6. **enregistrer** en base
7. **propager** — notifier le reste du système
8. **renvoyer** une réponse cohérente

<!-- incremental_lists: false -->

<!-- pause -->

> Les mêmes étapes quel que soit le projet.
> Ce qui change : l'archi et les libs, pas le mécanisme.

<!-- end_slide -->

## Zoom — recevoir

Ce qui arrive au serveur — du texte brut :

```
POST /users HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"email":"ada@example.com","password":"secret"}
```

- une **méthode** — `POST`, `GET`, `PATCH`…
- un **chemin** — `/users`
- des **en-têtes** — métadonnées de la requête
- un **corps** — les données envoyées

<!-- pause -->

Côté code, un serveur Express minimal :

```javascript
const express = require("express");
const app = express();

// sans cette déclaration, le serveur ne répond pas à cette route
app.post("/users", (req, res) => {
  // le contrôleur — appelé uniquement si méthode = POST et chemin = /users
});

app.listen(3000); // le serveur écoute sur le port 3000
```

<!-- end_slide -->

## Zoom — lire les données envoyées

Le client peut envoyer des données à **quatre endroits** :

<!-- pause -->

**Params d'URL** — dans le chemin lui-même

`DELETE /users/42` → `req.params.id` vaut `"42"`

<!-- pause -->

**Query params** — après le `?`

`GET /users?page=2&sort=asc` → `req.query.page` vaut `"2"`

<!-- pause -->

**Corps** — dans le body de la requête

`POST /users` avec `{"email":"ada@example.com"}` → `req.body.email`

Le corps arrive en texte brut — le serveur doit le décoder :
`app.use(express.json())` pour du JSON, `app.use(express.urlencoded(...))` pour les formulaires.
Sans ça, `req.body` est `undefined`.

<!-- pause -->

**En-têtes** — plutôt des métadonnées (`Content-Type`, `Accept`…),
mais aussi un endroit pour des données complémentaires :
token d'authentification, langue, version d'API… → `req.headers['authorization']`

<!-- end_slide -->

## Zoom — valider

**On ne fait jamais confiance à ce qui arrive du client.**

Pour chaque champ, on vérifie : présence · type · format · bornes

<!-- pause -->

Quelques exemples concrets :

- `email` — présent, string, contient `@` et un domaine valide
- `password` — présent, string, min 8 caractères
- `age` — nombre entier, entre 18 et 120
- `checkIn` — date valide, dans le futur
- `guests` — entier, min 1, max dépend des règles métier
- `phone` — string, correspond au pattern `06XXXXXXXX`

<!-- pause -->

Zod — un schéma déclaratif plutôt que des `if` en cascade :

```javascript
const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(8),
  age:      z.number().int().min(18).max(120),
  checkIn:  z.coerce.date().min(new Date()),
  phone:    z.string().regex(/^0[67]\d{8}$/),
});
const result = schema.safeParse(req.body);
if (!result.success) return res.status(400).json(result.error.flatten());
```

<!-- end_slide -->

## Zoom — règles métier

Une règle métier, c'est un **choix arbitraire du produit** — pas une contrainte sur la forme des données.

Elle confronte la requête à l'**état du système** ou à une **politique décidée** par l'équipe.

<!-- pause -->

Exemples :

- *Inscription* — cet email est-il déjà pris ?
- *E-commerce* — ce code promo a-t-il déjà été utilisé par ce compte ?
- *Réservation* — le logement est-il disponible sur ces dates ?
- *Streaming* — le plan gratuit n'autorise qu'un seul écran simultané
- *Virement* — plafond de 3 000 € par jour, quelle que soit la somme disponible
- *Marketplace* — un vendeur ne peut pas acheter ses propres annonces

<!-- pause -->

<!-- new_line -->

La différence clé : la validation se répond en regardant la **requête seule**.
La règle métier exige d'aller interroger la **base ou une politique produit**.

<!-- end_slide -->

## Zoom — transformer

Les données arrivent rarement prêtes à l'emploi. Exemples courants :

- **trim + casse** — `"  Ada@Example.COM  "` → `"ada@example.com"`
- **coercion** — `"42"` (string) → `42` (number) · `"2024-06-01"` → objet `Date`
- **slug** — `"Ada Tech School"` → `"ada-tech-school"` pour une URL
- **calcul dérivé** — `firstName + " " + lastName` → `fullName`
- **hachage** — `"secret"` → `"$2b$10$..."` via bcrypt, à sens unique, jamais renvoyé

<!-- pause -->

Zod peut prendre en charge une partie de ces transformations :

```javascript
const schema = z.object({
  email:     z.string().trim().toLowerCase().email(),
  password:  z.string().min(8),              // hachage fait après, pas ici
  birthDate: z.coerce.date(),                // "2000-01-01" → Date
  username:  z.string().trim().toLowerCase(),
});
```

<!-- end_slide -->

## Zoom — hacher les mots de passe

On ne stocke **jamais** un mot de passe en clair. Si la base est compromise, tous les comptes le sont.

<!-- pause -->

Le hachage est une opération **à sens unique** :

```
"monsecret"  →  "$2b$10$X4kev...hqZ"   ✓ facile
"$2b$10$..."  →  ???                    ✗ impossible
```

<!-- pause -->

Pour vérifier un mot de passe à la connexion, on ne déchiffre pas —
on **rehache** ce que l'utilisateur a saisi et on compare :

```javascript
await bcrypt.compare("monsecret", hashStocké); // true ou false
```

<!-- pause -->

Pour casser un hash, un attaquant doit **tester chaque mot de passe possible**
contre le hash jusqu'à trouver lequel le produit — une par une.

C'est là qu'intervient le **coût** (`saltRounds`) : plus il est élevé,
plus chaque tentative est lente à calculer.

```javascript
const hashed = await bcrypt.hash(password, 12); // 12 rounds = ~300ms
```

Avec 12 rounds, tester un million de mots de passe prend des jours.
Avec 6, quelques minutes.

<!-- end_slide -->

## Zoom — enregistrer

C'est ici qu'on écrit en base — après validation, règles métier et transformation.
Le contrôleur envoie une requête SQL via le driver :

```javascript
const result = await db.query(
  `INSERT INTO users (email, password)
   VALUES ($1, $2)
   RETURNING id, email`,
  [email, hashed]
);
const user = result.rows[0];
```

<!-- pause -->

`$1`, `$2`… sont des **paramètres positionnels** : les valeurs sont passées séparément,
le driver (ici `pg`) se charge de les intégrer proprement.

<!-- pause -->

`RETURNING` évite un second aller-retour en base — on récupère directement
l'enregistrement créé, avec son `id` généré par la base.

<!-- end_slide -->

## Zoom — propager

Une fois la donnée sauvegardée, d'autres parties du système peuvent avoir besoin de le savoir.

<!-- pause -->

Exemples :

- **e-mail de bienvenue** — confirmation d'inscription envoyée à l'utilisateur
- **notification Slack** — l'équipe est alertée d'un nouveau compte
- **événement dans une queue** — un service analytics, un service de recommandation… consomme l'événement `user.created`
- **mise à jour d'un index** — le nouvel utilisateur apparaît dans la recherche

<!-- pause -->

Ces actions se déclenchent **après** la persistance — jamais avant.
Si on envoie l'e-mail avant de sauvegarder et que la sauvegarde échoue,
l'utilisateur reçoit une confirmation pour un compte qui n'existe pas.

<!-- pause -->

Elles sont souvent **asynchrones** : on pousse un job en arrière-plan
et on répond à l'utilisateur sans attendre leur exécution.

<!-- end_slide -->

## Zoom — répondre

Ce que le serveur renvoie — du texte brut :

```
HTTP/1.1 201 Created
Content-Type: application/json

{"id":12,"email":"ada@example.com"}
```

- un **code de statut** — `201` créé · `400` invalide · `409` conflit · `500` erreur serveur
- un **corps** de forme constante · **jamais** le mot de passe

<!-- pause -->

Côté code, la fin d'un contrôleur Express :

```javascript
app.post("/users", async (req, res) => {
  // ... validation, règles métier, transformation, enregistrement

  return res.status(201).json({ id: user.id, email: user.email });
});
```

<!-- pause -->

En cas d'erreur, on répond aussi — avec le bon statut :

```javascript
if (!email) return res.status(400).json({ error: "Email requis" });
if (exists)  return res.status(409).json({ error: "Email déjà pris" });
```

<!-- end_slide -->

<!-- jump_to_middle -->

# Les mêmes mécanismes, d'autres stacks

<!-- end_slide -->

## Flask — Python

Reçoit du **form data**, architecture *server-rendered* (redirection).

```python
@app.route("/register", methods=["POST"])
def register():
    email = request.form.get("email", "").strip().lower()   # lire + normaliser
    password = request.form.get("password", "")

    errors = []                                              # validation
    if not email or "@" not in email:
        errors.append("Email invalide")
    if len(password) < 8:
        errors.append("Mot de passe trop court")
    if errors:
        return render_template("register.html", errors=errors), 400

    if User.query.filter_by(email=email).first():           # règle métier
        return render_template("register.html", errors=["Email déjà pris"]), 409

    hashed = generate_password_hash(password)               # transformation
    db.session.add(User(email=email, password=hashed))      # persistance
    db.session.commit()
    return redirect(url_for("login"))                       # réponse : redirection
```

<!-- end_slide -->

## Spring Boot

Reçoit du **JSON**, API pure.

```java
// RegisterRequest.java — corps attendu ; les annotations portent la validation
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotBlank String firstName,
    @NotBlank String lastName
) {}

// UserResponse.java — ce qu'on renvoie : jamais le mot de passe
public record UserResponse(Long id, String email) {}

// UserController.java
@PostMapping("/users")
public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest body) {
    // VALIDATION : déléguée à @Valid + annotations → 400 automatique

    if (users.existsByEmail(body.email()))                    // RÈGLE MÉTIER
        return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409

    String email  = body.email().trim().toLowerCase();        // TRANSFORMER
    String hashed = passwordEncoder.encode(body.password());

    User saved = users.save(                                  // PERSISTER
        new User(email, hashed, body.firstName(), body.lastName()));

    return ResponseEntity.status(HttpStatus.CREATED)          // RÉPONDRE — 201
        .body(new UserResponse(saved.getId(), saved.getEmail()));
}
```

<!-- end_slide -->

## Ce qu'on retient

<!-- incremental_lists: true -->

- derrière une route, il y a un **enchaînement d'étapes** — chacune a un rôle, et l'ordre compte
- **validation ≠ règles métier** : deux questions distinctes, à deux moments distincts
- on ne fait **jamais confiance** aux données qui arrivent du client
- la **réponse est un contrat** : bon statut, corps cohérent, jamais de mot de passe
- la logique est la même d'un langage à l'autre — c'est la **syntaxe qui change**, pas le raisonnement

<!-- incremental_lists: false -->
