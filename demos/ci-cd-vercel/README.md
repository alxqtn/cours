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

1. Créer **2 projets** sur [vercel.com](https://vercel.com) : un pour l'API (`api/`), un pour le frontend (`web/`)
2. Récupérer les identifiants :
   - **VERCEL_TOKEN** : Settings > Tokens (un seul token pour les deux projets)
   - **VERCEL_ORG_ID** : Settings > General > Your ID
   - **VERCEL_API_PROJECT_ID** : Project Settings > General > Project ID (projet API)
   - **VERCEL_WEB_PROJECT_ID** : Project Settings > General > Project ID (projet Web)
3. Ajouter ces 4 valeurs comme **secrets** dans les paramètres de votre repo GitHub (Settings > Secrets and variables > Actions)
4. Dans le projet Web sur Vercel, ajouter la variable d'environnement `VITE_API_URL` pointant vers l'URL de l'API déployée

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
- **Jobs parallèles** : l'API et le frontend sont déployés en parallèle après la CI
- **Déploiement conditionnel** : seuls les pushs sur `main` déclenchent le déploiement (`if:`)
- **Filtres de chemins** : le workflow ne s'exécute que si les fichiers concernés changent (`paths:`)
- **Monorepo simple** : un workflow qui gère plusieurs projets avec `working-directory`
- **Secrets GitHub** : gestion sécurisée des tokens et identifiants
