---
title: "Les migrations de base de données"
sub_title: "Avec Drizzle ORM"
author: ""
theme:
  name: light
---

Pourquoi des migrations ?
=========================

La base de données évolue avec le code — mais ce n'est **pas du code**.

<!-- pause -->

Sans outil dédié :

<!-- incremental_lists: true -->

- impossible de reproduire exactement le même schéma sur une autre machine
- pas de trace de *ce qui a changé*, *quand*, *pourquoi*
- coordination difficile en équipe

<!-- incremental_lists: false -->

<!-- pause -->

Vous avez déjà écrit des fichiers SQL `up` et `down` à la main.
Les ORM modernes automatisent ça — avec plusieurs approches possibles.

<!-- speaker_note: "Warm-up ~5min. Référence aux TP précédents où ils ont écrit du SQL à la main. Les migrations, c'est le même besoin qu'avec git - tracer l'évolution et pouvoir la rejouer sur une autre machine." -->

<!-- end_slide -->

CODE FIRST vs DATABASE FIRST
=============================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**CODE FIRST**

```
schema.ts
    ↓
Base de données
```

Votre TypeScript est la **source de vérité**.

<!-- column: 1 -->

**DATABASE FIRST**

```
Base de données
    ↓
drizzle-kit pull
    ↓
schema.ts
```

La DB existante est la **source de vérité**.

<!-- reset_layout -->

**Database first** : utile pour intégrer Drizzle sur une DB existante.
`drizzle-kit pull` introspecte la DB et génère le schéma TypeScript correspondant.

**On se concentre sur code first pour la suite.**

<!-- speaker_note: "Très rapide ~3min. Database first c'est une option pour les projets legacy, on n'y reviendra pas. Code first c'est le cas d'école." -->

<!-- end_slide -->

Code first : deux modes
========================

```
                    ┌─────────────┐
                    │  schema.ts  │
                    └──────┬──────┘
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
        drizzle-kit push       drizzle-kit generate
               │                       │
               │                       ▼
               │               migrations/*.sql
               │               (dans le repo git)
               │                       │
               │                       ▼
               │               drizzle-kit migrate
               │                       │
               └───────────┬───────────┘
                           │
                           ▼
                    Base de données
```

Deux stratégies, un même résultat : synchroniser le code et la DB.

<!-- speaker_note: "Schéma important - bien le décortiquer. Montrer que les deux chemins convergent vers la même base de données. Souligner la différence : push c'est direct, generate+migrate c'est via des fichiers." -->

<!-- end_slide -->

`drizzle-kit push`
==================

**Synchronisation directe : pas de fichiers générés.**

```
schema.ts  ──►  introspection DB  ──►  calcul du diff  ──►  ALTER TABLE ...
```

<!-- pause -->

**Trois étapes :**

<!-- incremental_lists: true -->

1. Drizzle lit le schéma actuel de la DB
2. Calcule le diff avec `schema.ts`
3. Applique les changements directement

<!-- incremental_lists: false -->

<!-- pause -->

```bash
npx drizzle-kit push
```

**Avantages ✅**

<!-- incremental_lists: true -->

- Rapide, zéro friction
- Idéal pour prototyper, itérer sur un schéma local

<!-- incremental_lists: false -->

<!-- speaker_note: "~5min. Montrer que c'est la solution rapide pour le développement local. On verra après pourquoi c'est pas idéal en équipe / prod." -->

<!-- end_slide -->

`drizzle-kit generate` + `drizzle-kit migrate`
===============================================

**Les changements passent par des fichiers SQL versionnés.**

```
schema.ts
    │
    ▼
drizzle-kit generate
    │
    ▼
drizzle/
├── 0000_initial.sql
├── 0001_add_email.sql     ◄── committés dans git
└── 0002_add_posts.sql
    │
    ▼
drizzle-kit migrate
    │
    ├── lit les fichiers .sql
    ├── consulte __drizzle_migrations en DB
    └── applique uniquement celles qui manquent
```

<!-- speaker_note: "Montrer le flux de fichiers. C'est plus bureaucratique mais c'est pour une bonne raison." -->

<!-- end_slide -->

Pourquoi `generate` + `migrate` en équipe / prod ?
===================================================

**CI/CD non-interactif** — `migrate` applique les fichiers dans l'ordre, sans ambiguïté. `push` peut bloquer s'il attend une confirmation humaine. ✅

<!-- pause -->

**Uniformité entre environnements** — le même fichier SQL est exécuté partout : dev, staging, prod. Ce qui a tourné en dev est exactement ce qui tournera en prod. ✅

<!-- pause -->

**Lisibilité et contrôle** — le SQL est généré dans des fichiers versionnés. On le lit avant de l'appliquer, on peut détecter une erreur (ex: un `DROP TABLE` inattendu), le modifier, ou y ajouter de la logique métier :

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

<!-- speaker_note: "Trois arguments : CI/CD automatisé, déterminisme entre envs, audit trail + contrôle du SQL. Insister sur le DROP TABLE inattendu - c'est un cas réel qui arrive avec push." -->

<!-- end_slide -->

Comment choisir ?
=================

```
Vous avez des données utilisateurs
à ne pas perdre en production ?
            │
     ┌──────┴──────┐
    NON            OUI
     │              │
     ▼              ▼
  push          generate
  suffit         + migrate
     │              │
     ▼              ▼
Prototype,     Équipe, staging,
solo, local    prod, CI/CD
```

Les deux approches **peuvent coexister** :
- `push` en local pour itérer
- `generate` + `migrate` pour les envs partagés

<!-- speaker_note: "Heuristic simple pour choisir. Insister : ces deux modes cohabitent, ce n'est pas l'un ou l'autre." -->
