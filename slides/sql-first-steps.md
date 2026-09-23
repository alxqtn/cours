---
title: "SQL : premiers pas"
sub_title: "Le pont JS → SQL, et l'introduction au relationnel"
author: Ada Tech School
---

<!-- jump_to_middle -->

# Le pont JS → SQL

<!-- end_slide -->

## Notre tableau JS

On repart du tableau qu'on vient de manipuler :

```javascript
let stagiaires = [
  { prenom: "Ada", nom: "Robin", age: 27 },
  { prenom: "Grace", nom: "Morel", age: 34 },
  { prenom: "Marie", nom: "Dubois", age: 22 },
  { prenom: "Sophie", nom: "Bernard", age: 45 },
];
```

<!-- pause -->

Tout est à plat, rien n'est trié : un tableau d'objets.

<!-- end_slide -->

## Ça devient une table

| JavaScript | SQL |
|---|---|
| `let stagiaires = [...]` | `TABLE stagiaires` |
| `stagiaires.filter(s => s.age >= 30)` | `SELECT * FROM stagiaires WHERE age >= 30` |
| `stagiaires.length` | `SELECT COUNT(*) FROM stagiaires` |
| `stagiaires.push({...})` | `INSERT INTO stagiaires VALUES (...)` |

<!-- pause -->

Ce que `filter` fait sur un tableau, `WHERE` le fait sur une table.

<!-- end_slide -->

<!-- jump_to_middle -->

# Introduction à SQL

<!-- end_slide -->

## Qu'est-ce qu'une base de données relationnelle ?

- Un ensemble de **tables**, chacune dédiée à un type d'objet
- Ici : une table `stagiaires`, une table `promos`
- Les tables peuvent être **liées entre elles** — d'où "relationnel"

<!-- pause -->

C'est exactement ce qu'on va construire aujourd'hui, avec ces deux tables.

<!-- end_slide -->

## Table, ligne, colonne, clé primaire, clé étrangère

```
stagiaires
┌────┬─────────┬──────────┬─────┬───────────┐
│ id │ prenom  │ nom      │ age │ promo_id  │
├────┼─────────┼──────────┼─────┼───────────┤
│ 1  │ Léna    │ Henry    │ 30  │ 1         │
│ 2  │ Lucas   │ Nicolas  │ 26  │ 1         │
│ 3  │ Emma    │ Leroy    │ 35  │ 1         │
└────┴─────────┴──────────┴─────┴───────────┘
```

<!-- pause -->

- Une **ligne** = un stagiaire, une **colonne** = une information sur lui
- `id` identifie chaque ligne de façon unique : c'est la **clé primaire** (*primary key*, `PK`)
- `promo_id` ne contient pas un nom, mais l'**id d'une ligne** de la table `promos` : c'est une **clé étrangère** (*foreign key*, `FK`)

<!-- pause -->

```
promos
┌────┬────────────────────────────┐
│ id │ nom                        │
├────┼────────────────────────────┤
│ 1  │ Promo Paris - Février 2024 │
└────┴────────────────────────────┘
```

La `FK` sert de pont entre les deux tables : `stagiaires` pointe vers `promos`.

<!-- end_slide -->

## Écrire une première requête : SELECT / FROM

```sql
SELECT * FROM stagiaires;
```

<!-- pause -->

- `SELECT` : quelles colonnes je veux voir (`*` = toutes)
- `FROM` : dans quelle table

<!-- pause -->

```sql
SELECT prenom, nom FROM stagiaires;
```

On peut choisir précisément les colonnes qu'on veut.

<!-- end_slide -->

## Filtrer avec WHERE

```sql
SELECT prenom, nom
FROM stagiaires
WHERE age >= 35;
```

<!-- pause -->

`WHERE` filtre les lignes selon une condition — exactement comme `filter` en JS.

<!-- pause -->

```sql
SELECT * FROM stagiaires WHERE promo_id = 1;
```

<!-- end_slide -->

## Limiter les résultats : LIMIT

```sql
SELECT * FROM stagiaires LIMIT 5;
```

<!-- pause -->

Utile pour explorer une grosse table sans tout afficher d'un coup — pratique en live coding.

<!-- end_slide -->

## Un aperçu de JOIN

```sql
SELECT s.prenom, s.nom, p.nom AS promo
FROM stagiaires s
JOIN promos p ON p.id = s.promo_id
LIMIT 5;
```

<!-- pause -->

`JOIN` permet de combiner deux tables grâce à une clé étrangère.

<!-- pause -->

On n'en fait pas d'exercice ce matin — on le pratique cet après-midi.

<!-- end_slide -->

## À vous de jouer

- Le quiz SQL sur Moodle vous attend
- Vous y écrirez vos propres requêtes `SELECT` / `WHERE` / `LIMIT`
- Base de données : `dataset-stagiaires-live-coding.sql`

<!-- end_slide -->
