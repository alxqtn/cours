# Démo CI/CD avec GitHub Actions + Vercel

Projet de démonstration d'un pipeline CI/CD complet : lint et tests automatiques (CI) puis déploiement sur Vercel (CD).

## Structure du projet

```
demos/ci-cd-vercel/
├── api/                        # Backend Express + TypeScript
│   └── src/
│       ├── server.ts           # GET /api/health, GET /api/message
│       └── server.test.ts      # Tests avec Node test runner
└── web/                        # Frontend React + Vite + TypeScript
    └── src/
        ├── App.tsx             # Composant principal
        ├── App.test.tsx        # Tests avec Vitest
        ├── api.ts              # Appel à l'API
        └── main.tsx            # Point d'entrée

# À la racine du repo :
.github/workflows/
└── ci-cd.yml                   # Workflow GitHub Actions
```

## Démarrage local

**Prérequis** : Node.js 20+

### API

```bash
cd api
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:3000`.

### Frontend

```bash
cd web
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173` et appelle l'API sur `http://localhost:3000`.

## Lancer les tests

```bash
# API
cd api
npm run lint
npm test

# Frontend
cd web
npm run lint
npm test
```

## Configuration Vercel

### 1. Créer un token Vercel

- Aller sur [vercel.com/account/tokens](https://vercel.com/account/tokens)
- Créer un token (par ex. `github-actions`) → c'est votre **VERCEL_TOKEN**

### 2. Récupérer votre Org ID

- Aller sur [vercel.com/account](https://vercel.com/account) > Settings > General
- Copier **Your ID** → c'est votre **VERCEL_ORG_ID**

### 3. Créer le projet API

- Sur Vercel, cliquer **Add New Project** > **Import Git Repository**
- Sélectionner votre repo, puis configurer :
  - **Root Directory** : `demos/ci-cd-vercel/api`
  - **Framework Preset** : `Other`
  - **Build Command** : laisser vide (pas de build nécessaire, Vercel utilise `vercel.json`)
  - **Output Directory** : laisser vide
- Cliquer **Deploy** (le premier déploiement se fera via l'interface, les suivants via GitHub Actions)
- Une fois créé, aller dans **Project Settings > General** et copier le **Project ID** → c'est votre **VERCEL_API_PROJECT_ID**

### 4. Créer le projet Web

- Sur Vercel, cliquer **Add New Project** > **Import Git Repository**
- Sélectionner votre repo, puis configurer :
  - **Root Directory** : `demos/ci-cd-vercel/web`
  - **Framework Preset** : `Vite`
  - **Build Command** : `npm run build` (par défaut)
  - **Output Directory** : `dist` (par défaut)
- Cliquer **Deploy**
- Copier le **Project ID** dans Project Settings > General → c'est votre **VERCEL_WEB_PROJECT_ID**

### 5. Désactiver le déploiement automatique de Vercel

Par défaut, Vercel déploie automatiquement à chaque push. Comme c'est le workflow GitHub Actions qui gère le déploiement, il faut désactiver cette fonctionnalité pour les deux projets :

- Project Settings > Git > **Connected Git Repository** > décocher **Auto-Deploy**

### 6. Ajouter les secrets GitHub

Dans votre repo GitHub, aller dans **Settings > Secrets and variables > Actions** et ajouter ces 4 secrets :

| Secret                   | Valeur                     |
| ------------------------ | -------------------------- |
| `VERCEL_TOKEN`           | Le token créé à l'étape 1  |
| `VERCEL_ORG_ID`          | Votre ID d'organisation    |
| `VERCEL_API_PROJECT_ID`  | Project ID du projet API   |
| `VERCEL_WEB_PROJECT_ID`  | Project ID du projet Web   |

> `VITE_API_URL` est automatiquement déduit de l'URL de déploiement de l'API et passé au build du frontend par le workflow. Pas besoin de le configurer manuellement.

## Utilisation du workflow

Le fichier de workflow se trouve à la racine du repo : `.github/workflows/ci-cd.yml`.

Il est configuré avec des **filtres de chemins** (`paths:`) pour ne s'exécuter que lorsque des fichiers dans `demos/ci-cd-vercel/` ou le workflow lui-même sont modifiés.

Le workflow :

- **Sur chaque push et pull request** (touchant la démo) : lance le lint et les tests (API + Web)
- **Sur push vers `main` uniquement** : déploie l'API et le frontend sur Vercel (en parallèle)

## Ce que ce projet illustre

- **Intégration Continue (CI)** : vérification automatique du code à chaque changement (lint + tests)
- **Déploiement Continu (CD)** : déploiement automatique en production après validation
- **Séparation CI / CD** : les déploiements dépendent du succès de la CI (`needs: ci`)
- **Chaînage de jobs avec outputs** : l'URL de l'API déployée est passée automatiquement au build du frontend
- **Déploiement conditionnel** : seuls les pushs sur `main` déclenchent le déploiement (`if:`)
- **Filtres de chemins** : le workflow ne s'exécute que si les fichiers concernés changent (`paths:`)
- **Monorepo simple** : un workflow qui gère plusieurs projets avec `working-directory`
- **Secrets GitHub** : gestion sécurisée des tokens et identifiants
