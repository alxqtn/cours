---
title: "Terminal & Git"
sub_title: "Versionnement, workflow, et messages qui ont du sens"
author: Alix
theme:
  name: catppuccin-latte
---

<!-- jump_to_middle -->

## Avant de commencer

**Sans regarder vos notes :**

<!-- pause -->

- Quelle est la différence entre `git add` et `git commit` ?
<!-- pause -->
- Qu'est-ce qu'un bon message de commit ?
<!-- pause -->
- Que fait exactement `git push` ?

<!-- speaker_note: Laisser la promo répondre entre elle. Ne pas corriger tout de suite. Noter qui hésite, qui se trompe, qui répond avec confiance. -->

<!-- end_slide -->

<!-- jump_to_middle -->

# Partie 1 — Le Terminal

<!-- end_slide -->

## Le terminal, c'est quoi ?

Une interface texte pour parler directement au système d'exploitation.

<!-- pause -->

Pas de clics. Pas de menus. Juste des commandes.

<!-- pause -->

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### Pourquoi s'en servir ?

- Plus rapide pour beaucoup d'opérations
- Indispensable pour Git, Node, npm…
- Les serveurs n'ont pas d'interface graphique

<!-- column: 1 -->

### Ce que vous savez déjà faire

```bash
pwd        # où suis-je ?
ls         # qu'est-ce qu'il y a ici ?
cd dossier # aller quelque part
cd ..      # remonter d'un niveau
```

<!-- reset_layout -->

<!-- end_slide -->

## Rappel : créer, déplacer, supprimer

```bash
mkdir mon-projet         # créer un dossier
touch index.html         # créer un fichier vide
cat index.html           # afficher le contenu d'un fichier
mv ancien.html new.html  # renommer / déplacer
rm fichier.txt           # supprimer un fichier
rm -r dossier/           # supprimer un dossier (récursif)
```

<!-- pause -->

> ⚠️ `rm` est définitif. Pas de corbeille. Pas d'annulation.

<!-- pause -->

**Astuce** : Tab complète les noms de fichiers. Flèche ↑ rappelle la commande précédente.

<!-- end_slide -->

<!-- jump_to_middle -->

# Partie 2 — Git

## La logique avant les commandes

<!-- end_slide -->

## Pourquoi versionner ?

Imaginez travailler sans Git :

<!-- incremental_lists: true -->

- `index_final.html`
- `index_final_v2.html`
- `index_VRAIMENT_final.html`
- `index_VRAIMENT_final_corrigé.html`
- `index_NE_PAS_SUPPRIMER.html`

<!-- incremental_lists: false -->

<!-- pause -->

Git, c'est un **historique structuré** de votre projet.

Chaque commit = un état sauvegardé, avec un auteur, une date, et un message.

<!-- end_slide -->

## Les trois zones de Git

<!-- column_layout: [1, 1, 1] -->

<!-- column: 0 -->

### Working directory

Vos fichiers tels qu'ils sont sur le disque

*Ce que vous éditez*

<!-- column: 1 -->

### Staging area

Les changements que vous préparez pour le prochain commit

*Ce que vous choisissez*

<!-- column: 2 -->

### Repository

L'historique des commits

*Ce que vous sauvegardez*

<!-- reset_layout -->

<!-- pause -->

```
[fichiers modifiés]  →  git add  →  [staging]  →  git commit  →  [historique]
```

<!-- end_slide -->

## Le workflow complet

```bash
# 1a. Créer un nouveau repo (une seule fois)
git init

# 1b. Ou récupérer un repo existant (depuis GitHub)
git clone https://github.com/user/projet.git

# 2. Récupérer les dernières modifications de l'équipe
git pull origin main

# 3. Vérifier l'état courant (souvent !)
git status

# 4. Ajouter des fichiers au staging
git add index.html        # un fichier précis
git add .                 # tout ce qui a changé

# 5. Commiter
git commit -m "feat: add homepage structure"

# 6. Envoyer sur GitHub
git push origin main
```

<!-- pause -->

> **`origin`** = le nom du dépôt distant (sur GitHub) — c'est la convention par défaut.
> **`main`** = le nom de la branche principale du projet.

<!-- end_slide -->

## `git add .` vs `git add fichier`

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### `git add .`

Ajoute *tout* ce qui a changé dans le dossier courant.

Pratique, mais attention :

- fichiers de config locaux
- mots de passe oubliés dans le code
- fichiers générés (`node_modules/`…)

> Si vous utilisez `git add .`, il est impératif de regarder avant via `git status` ce qui serait ajouté, et/ou de vérifier les fichiers du commit avant le push pour éviter de publier des fichiers par erreur.

<!-- column: 1 -->

### `git add fichier`

Ajoute uniquement ce fichier.

Plus précis, plus intentionnel.

Recommandé quand vous avez plusieurs changements sans rapport entre eux.

<!-- reset_layout -->

<!-- end_slide -->

## Le fichier `.gitignore`

Git traque tout ce qu'il voit. Certains fichiers ne devraient **jamais** être versionnés.

<!-- pause -->

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### Ce qu'on ignore typiquement

```
node_modules/
.env
.DS_Store
dist/
*.log
```

<!-- column: 1 -->

### Comment ça marche

Créez un fichier `.gitignore` à la racine du projet et listez les fichiers ou dossiers à ignorer.

Git les ignorera complètement, même avec `git add .`

<!-- reset_layout -->

<!-- pause -->

> La plupart du temps, lorsque vous commencez un projet avec un framework, le fichier `.gitignore` est généré avec les fichiers et dossiers adaptés. Il est fréquent d'y ajouter des lignes cela dit !

<!-- end_slide -->

## Revenir en arrière

C'est l'un des atouts majeurs de Git : **rien n'est vraiment perdu tant qu'on a enregistré l'état avec un commit**.

Prenez le réflexe de vous dire: **ça fonctionne enfin, je fais un commit**. Ensuite vous pouvez optimiser, corriger, nettoyer le code mais si ça casse vous pourrez toujours revenir en arrière.

<!-- pause -->

> La staging area est déjà en soi une pré-sauvegarde: on peut très facilement revenir à l'état du fichier quand il a été stagé avec `git add`.

<!-- end_slide -->

## Les branches

Une branche = une **version parallèle** du projet.

<!-- pause -->

En équipe, chaque personne travaille sur sa propre branche → pas d'interférence avec le travail des autres.

<!-- pause -->

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### Créer et changer de branche

```bash
# Créer et aller sur une branche
git checkout -b ma-feature

# Voir toutes les branches
git branch
```

<!-- column: 1 -->

### Fusionner une branche

```bash
# Retourner sur main
git checkout main

# Intégrer les changements
git merge ma-feature
```

<!-- reset_layout -->

<!-- pause -->

> En équipe, on merge rarement directement : on passe par une **pull request** sur GitHub, pour que l'équipe puisse relire le code avant de l'intégrer.

<!-- end_slide -->

## Conflits

Un conflit se produit quand deux personnes ont modifié le **même endroit** dans le même fichier.

Git ne peut pas choisir seul → il vous demande de trancher.

<!-- pause -->

```
<<<<<<< HEAD
  <h1>Bienvenue !</h1>
=======
  <h1>Bienvenue sur le site</h1>
>>>>>>> ma-feature
```

<!-- pause -->

Git vous montre les deux versions côte à côte. Vous choisissez, supprimez les marqueurs, puis vous commitez.

<!-- pause -->

> Les bons commits, les branches courtes et les pull requests régulières **réduisent drastiquement** les conflits.

<!-- end_slide -->

<!-- jump_to_middle -->

# Partie 3 — Messages de commit

## Écrire de bons messages de commit

<!-- end_slide -->

## Un commit, c'est une lettre à votre futur vous

<!-- pause -->

```bash
git log --oneline
```

<!-- pause -->

### Ce que vous ne voulez pas voir

```
a3f2c1b modif
9e1d4aa update
cc82301 fix
b77f210 aaaaaa
```

<!-- pause -->

### Ce que vous voulez voir

```
a3f2c1b feat: add contact form with validation
9e1d4aa fix: correct mobile nav overlap on small screens
cc82301 docs: update README with install instructions
b77f210 style: apply consistent spacing on homepage
```

<!-- end_slide -->

## Pourquoi ça compte vraiment

Un bon message de commit permet de :

<!-- incremental_lists: true -->

- **Comprendre** ce qui a changé sans lire le code
- **Retrouver** un bug introduit à quelle étape
- **Travailler en équipe** sans avoir à tout expliquer oralement
- **Passer un entretien** — les recruteurs regardent vos repos

<!-- incremental_lists: false -->

<!-- pause -->

> Vous pouvez ajouter d'autres lignes pour mieux décrire un commit ou donner du contexte en ajoutant un deuxième `-m "message"`, par exemple :

```
git commit -m "fix: correct mobile nav overlap on small screen" -m "I had to use z-index because elements were not stacked properly"
```

<!-- end_slide -->

## La règle simple

Un bon message répond à la question :

<!-- pause -->

<!-- alignment: center -->

*"Ce commit fait quoi ?"*

<!-- alignment: left -->

<!-- pause -->

```
✅ "add user login form"
✅ "fix broken link in footer"
✅ "remove unused CSS variables"

❌ "update"
❌ "fix bug"
❌ "wip"
❌ "."
```

<!-- pause -->

**Aller plus loin** : Conventional Commits → [conventionalcommits.org](https://www.conventionalcommits.org/fr)

`feat:` `fix:` `docs:` `style:` `refactor:` `test:`

<!-- end_slide -->

## Récapitulatif

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

### Les commandes clés

```bash
git init / git clone
git pull origin main
git status
git add . / git add fichier
git commit -m "message"
git push origin main
git log --oneline
git checkout -b ma-branche
git restore fichier
```

<!-- column: 1 -->

### Les bonnes pratiques

- `git pull` avant de commencer
- `git status` avant tout commit
- Un commit = une intention
- Message clair et précis
- `.gitignore` pour ce qui ne doit pas être versionné
- Travailler en branches, merger via PR

<!-- reset_layout -->

<!-- pause -->

<!-- alignment: center -->

*Place à la démo 🚀*

<!-- end_slide -->
