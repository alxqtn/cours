---
title: "**Programmation Orientée Objet**"
sub_title: Introduction
---

<!-- jump_to_middle -->

# Pourquoi la POO ?

<!-- end_slide -->

La Programmation Orientée Objet, c'est quoi ?
===============================================

Un **paradigme de programmation** qui modélise le code avec des **familles d'objets** — chacune ayant des **attributs** (données) et des **méthodes** (comportements).

<!-- pause -->

Peut être utilisé partout : jeux vidéo, applications desktop / mobile / web, scripts, outils système, simulations...

> Pas besoin de base de données (pour le moment) — on modélise directement dans le code.

<!-- pause -->

Exemples :

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

**Un client (app bancaire)**
- *Attributs :* `nom`, `email`, `solde`
- *Méthodes :* `deposer(montant)`, `retirer(montant)`

**Une voiture (simulation)**
- *Attributs :* `vitesse`, `carburant`, `position`
- *Méthodes :* `accelerer()`, `freiner()`

<!-- column: 1 -->

**Un deck (jeu de poker)**
- *Attributs :* `cartes`, `pioche`, `defausse`
- *Méthodes :* `melanger()`, `tirer()`

**Une tâche (to-do app)**
- *Attributs :* `titre`, `statut`, `priorite`
- *Méthodes :* `marquerFaite()`, `changerPriorite(p)`

<!-- reset_layout -->

<!-- end_slide -->

<!-- jump_to_middle -->

# Classes, instances, constructeurs

<!-- end_slide -->

La classe : un **moule**
=========================

Un moule à gaufres définit la **forme**. Chaque gaufre produite est une **instance** distincte — même forme, mais la pâte peut être différente.

La classe, c'est le moule. L'objet, c'est la gaufre.

<!-- pause -->

Exemple d'un personnage de jeu vidéo :

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

```mermaid +render
classDiagram
  class Character {
    name: string
    hp: number
    attackPower: number
    isAlive()
    takeDamage(amount)
  }
```

<!-- column: 1 -->

```typescript +line_numbers
class Character {
  name: string
  hp: number
  attackPower: number

  constructor(name: string, hp: number, attackPower: number) {
    this.name = name
    this.hp = hp
    this.attackPower = attackPower
  }

  isAlive(): boolean {
    return this.hp > 0
  }

  takeDamage(amount: number): void {
    this.hp -= amount
  }
}
```

<!-- reset_layout -->

<!-- end_slide -->

Instancier une classe
======================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

```typescript
const hero = new Character("Alix", 100, 15)
const goblin = new Character("Goblin", 40, 8)
const dragon = new Character("Dragon", 300, 50)
```

`new` appelle le **constructeur** et crée une instance en mémoire.

```typescript
console.log(hero.name)      // "Alix"
console.log(goblin.isAlive()) // true

goblin.takeDamage(50)
console.log(goblin.isAlive()) // false
```

Chaque instance a son **propre état**.

<!-- column: 1 -->

```mermaid +render
flowchart TB
  subgraph Classe
    C["🏭 Character"]
  end
  subgraph Instances
    H["🧑 hero<br/>hp: 100"]
    G["👺 goblin<br/>hp: 40"]
    D["🐉 dragon<br/>hp: 300"]
  end
  C -->|new| H
  C -->|new| G
  C -->|new| D
```

<!-- reset_layout -->

<!-- end_slide -->

C'est quoi `this` ?
====================

```typescript
class Character {
  name: string

  constructor(name: string) {
    this.name = name  // ← "this" = l'instance en cours de création
  }

  greet(): string {
    return `Je m'appelle ${this.name}` // ← "this" = l'instance qui appelle la méthode
  }
}

const hero = new Character("Alix")
hero.greet() // "Je m'appelle Alix"
```

<!-- pause -->

`this` est une référence à **l'instance elle-même**.

Quand `hero.greet()` s'exécute, `this` pointe vers `hero`.
Quand `goblin.greet()` s'exécute, `this` pointe vers `goblin`.

<!-- end_slide -->

Vocabulaire à retenir
======================

<!-- incremental_lists: true -->

- **Classe** → le moule, le plan de construction (`Character`)
- **Instance** → un objet créé à partir de la classe (`hero`, `goblin`)
- **Attribut** → une donnée de l'objet (`name`, `hp`)
- **Méthode** → une fonction de l'objet (`isAlive()`, `takeDamage()`)
- **Constructeur** → la méthode appelée par `new` pour initialiser l'instance
- **`this`** → référence à l'instance courante

<!-- incremental_lists: false -->

<!-- pause -->

> Une instance, c'est un objet. Et la plupart du temps quand on parle en langage POO, si on parle d'un objet on parle d'une instance.

<!-- end_slide -->

Pourquoi définir des méthodes ?
================================

<!-- column_layout: [1, 1] -->

<!-- column: 0 -->

```typescript
class Character {
  name: string
  hp: number

  constructor(name: string, hp: number) {
    this.name = name
    this.hp = hp
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount)
  }

  isAlive(): boolean {
    return this.hp > 0
  }
}
```

<!-- column: 1 -->

On pourrait écrire :

```typescript
hero.hp = hero.hp - 30
if (hero.hp > 0) { ... }
```

Mais on préfère :

```typescript
hero.takeDamage(30)
if (hero.isAlive()) { ... }
```

<!-- reset_layout -->

<!-- pause -->

**Pourquoi ?**

<!-- incremental_lists: true -->

- **Lisibilité** : le code client est plus clair. `hero.takeDamage(30)` se lit instantanément. `hero.hp = hero.hp - 30` demande un effort d'interprétation.
- **Documentation vivante** : en lisant la classe, on voit les données ET les fonctions qui les modifient. On comprend d'un coup d'œil comment interagir avec l'objet.
- **Logique centralisée** : si les règles changent (HP minimum à 0, armure, etc.), on modifie un seul endroit.

<!-- incremental_lists: false -->

<!-- end_slide -->

<!-- jump_to_middle -->

# 🛠️ Exercice 1

<!-- end_slide -->

Exercice 1 — Application de location de films
===============================================

Nous allons modéliser une application de location de films.

<!-- pause -->

**Étape 1 — Créer les classes**

Créez les classes `Film` et `Realisatrice` avec leurs attributs.
- Les **films** ont un titre, une date de sortie, ainsi qu'une réalisatrice.
- Les **réalisatrices** ont un nom, un prénom et une année de naissance.

**Étape 2 — Fonction d'affichage**

Écrivez une méthode `presenter()` sur un `Film` qui affiche (logge) :

> "Le film Anatomie d'une chute est sorti en 2023 et est réalisé par Justine Triet"

Instanciez 3 films avec leurs réalisatrices et testez votre fonction.

**Étape 3 — Clients**

Créez une classe `Client` avec nom, prénom, et une liste de films en location.
Ajoutez une méthode `louerFilm(film: Film)` qui ajoute à la liste.

<!-- end_slide -->

<!-- jump_to_middle -->

# Héritage et spécialisation

<!-- end_slide -->

Le problème : des classes trop similaires
==========================================

On veut modéliser un héros et un dragon. Tous deux ont un nom, des HP, de l'attaque...

```typescript
class Hero {
  name: string; hp: number; attackPower: number
  takeDamage(amount: number) { ... }
  isAlive() { ... }
  levelUp() { ... }  // spécifique au héros
}

class Dragon {
  name: string; hp: number; attackPower: number
  takeDamage(amount: number) { ... }  // code identique
  isAlive() { ... }                   // code identique
  breatheFire(target) { ... }         // spécifique au dragon
}
```

<!-- pause -->

`takeDamage` et `isAlive` sont **copiés-collés**. Si on corrige un bug dans l'un, il faut penser à l'autre.

<!-- end_slide -->

L'héritage : factoriser le commun
====================================

Comme les espèces animales : un chien et un chat **respirent, mangent, vieillissent** (comportements communs). Mais chacun a ses spécificités. On ne réinvente pas "respirer" pour chaque espèce.

Ici, c'est pareil : on peut garder notre classe personnage (`Character`) avec les attributs et comportements communs, et en "hériter" dans différents types de personnages.

```mermaid +render
classDiagram
  Character <|-- Hero
  Character <|-- Dragon
  class Character {
    name: string
    hp: number
    attackPower: number
    takeDamage(amount)
    isAlive()
  }
  class Hero {
    level: number
    levelUp()
  }
  class Dragon {
    breatheFire(target)
  }
```

<!-- end_slide -->

On hérite avec `extends`
==========================

```typescript +line_numbers
class Hero extends Character {
  level: number

  constructor(name: string) {
    super(name, 100, 15)  // appelle le constructeur de Character
    this.level = 1
  }

  levelUp(): void {
    this.level++
    this.attackPower += 5
    console.log(`${this.name} passe au niveau ${this.level} !`)
  }
}

class Dragon extends Character {
  constructor() {
    super("Dragon", 300, 50)
  }

  breatheFire(target: Character): void {
    target.takeDamage(this.attackPower * 2)
  }
}
```

<!-- end_slide -->

Ce qu'on hérite
================

```typescript
const hero = new Hero("Alix")

hero.takeDamage(30)   // ✅ hérité de Character
hero.isAlive()        // ✅ hérité de Character
hero.levelUp()        // ✅ défini dans Hero

const dragon = new Dragon()
dragon.takeDamage(10) // ✅ hérité de Character
dragon.breatheFire(hero) // ✅ défini dans Dragon
```

<!-- pause -->

`Hero` et `Dragon` ont tout ce que `Character` propose, **plus** ce qu'ils définissent eux-mêmes.

<!-- pause -->

`super(...)` dans le constructeur enfant → appelle le constructeur parent. **Obligatoire** si la classe parent a un constructeur.

<!-- end_slide -->

Surcharger une méthode : `override`
=====================================

Un enfant peut **remplacer** le comportement d'une méthode héritée avec `override` et `super`.

```typescript
class Boss extends Character {
  constructor() {
    super("Boss Final", 1000, 80)
  }

  // Le boss a un comportement différent quand il prend des dégâts
  override takeDamage(amount: number): void {
    const reduced = Math.floor(amount * 0.5)  // résistance aux dégâts
    super.takeDamage(reduced)                  // on appelle quand même le parent
  }
}
```

<!-- pause -->

`super.takeDamage(reduced)` → appelle la version **parent** de la méthode.

<!-- end_slide -->

Classes abstraites
===================

Parfois, une classe parent n'a pas vocation à être instanciée directement. On ne crée jamais un `Character` générique — on crée toujours un `Hero`, un `Dragon`, un `Boss`...

```typescript
abstract class Character {
  name: string
  hp: number

  constructor(name: string, hp: number) {
    this.name = name
    this.hp = hp
  }

  takeDamage(amount: number): void {
    this.hp -= amount
  }

  // Méthode abstraite : pas d'implémentation ici
  // Les enfants DOIVENT la définir
  abstract attaquer(cible: Character): void
}
```

<!-- pause -->

- `abstract class` → impossible de faire `new Character(...)`
- `abstract attaquer(...)` → chaque enfant doit fournir sa propre implémentation

<!-- end_slide -->

Implémenter une méthode abstraite
==================================

```typescript
class Hero extends Character {
  attaquer(cible: Character): void {
    console.log(`${this.name} frappe avec son épée !`)
    cible.takeDamage(20)
  }
}

class Dragon extends Character {
  attaquer(cible: Character): void {
    console.log(`${this.name} crache du feu !`)
    cible.takeDamage(50)
  }
}
```

<!-- pause -->

Le parent définit **ce qui doit exister**. Les enfants définissent **comment**.

> Si tu oublies d'implémenter `attaquer()` dans une classe enfant, TypeScript te donnera une erreur.

<!-- end_slide -->

<!-- jump_to_middle -->

# 🛠️ Exercice 2

<!-- end_slide -->

Exercice 2 — Flotte spatiale
=============================

Nous allons modéliser une flotte de vaisseaux spatiaux.

Voici les données à représenter :

| Nom | Type | Taille (m) | Canons | Capacité (personnes) |
|-----|------|------------|--------|-------------------|
| Acclamator | Croiseur | 752 | — | 700 |
| Corvette CR90 | Croiseur | 150 | — | 165 |
| X-wing | Intercepteur | 12.5 | 2 | — |
| Y-wing | Intercepteur | 23 | 2 | — |

<!-- pause -->

Crée 3 classes avec de l'héritage :

- `Vaisseau` (classe abstraite):
  - attributs `nom`, `type` et `taille`
  - la méthode `afficherCaracteristiques()` qui affiche le nom, le type et la taille
- `Croiseur` qui hérite de `Vaisseau`
  - ajoute les attributs `capacité` et `personnesABord`
  - la méthode `charger(nombre: number)` qui ajoute des personnes (sans dépasser la capacité)
  - la méthode `décharger(nombre)` qui fait l'inverse.
- `Intercepteur` hérite de `Vaisseau`
  - ajoute les attributs `canons`, un `nombreDeTirs` initialisé à 0
  - une méthode `tirer()` qui logge "Tire !" et ne fonctionne que si `nombreDeTirs < canons` (sinon affiche "Plus de munitions");
  - une méthode `recharger()` qui logge "Recharge !" et réinitialise `nombreDeTirs`.

> N'oublie pas : le constructeur de chaque classe enfant doit appeler `super(...)` pour initialiser le parent

<!-- end_slide -->

Tester votre code
===================

<!-- pause -->

1. Instancie **deux Acclamator** et **un X-wing**

2. Sur un Acclamator :
   - Charge 600 hommes → doit fonctionner
   - Charge 200 hommes de plus → doit échouer (capacité max : 700)

<!-- pause -->

3. Sur le X-wing (2 canons) :
   - Tire 3 fois → les 2 premiers coups fonctionnent, le 3ème échoue
   - Recharge
   - Tire à nouveau → doit fonctionner

<!-- end_slide -->

<!-- jump_to_middle -->

# JavaScript, TypeScript et la POO

<!-- end_slide -->

JavaScript est-il orienté objet ?
==================================

**Réponse courte : pas vraiment, ou pas au sens classique.**

JavaScript est **multi-paradigme** : on peut coder en impératif, fonctionnel, ou orienté objet. Le langage ne t'oblige à rien.

<!-- pause -->

Ce qui distingue JS des langages "vraiment" OO (Ruby, Java, C#) :

- Le mot-clé `class` est un peu décoratif — il n'existe pas de "vraies" classes en JS
- `typeof monObjet` retourne `"object"`, pas le nom de la classe
- Pour tester si un objet est une instance, il faut utiliser `instanceof`

> JavaScript utilise un système de **prototypes** pour simuler l'orienté objet. C'est un sujet avancé. Si tu veux approfondir, cherche "JavaScript prototypes". Pour l'instant, retiens juste que `class` en JS est une façade qui cache ce mécanisme de prototype.

```typescript
const hero = new Character("Alix", 100)
typeof hero          // "object"
hero instanceof Character  // true
```

<!-- pause -->

Cependant, les principales fonctionnalités qui permettent de développer en orienté objet ont été implémentées en JavaScript et il est courant de voir des projets JavaScript utilisant de la POO, au moins à certains endroits. Par ailleurs, TypeScript vient rajouter un certain nombre de fonctionnalités utiles en POO qu'on va voir par la suite.

<!-- pause -->

<!-- end_slide -->

<!-- jump_to_middle -->

# Encapsulation avec TypeScript

<!-- end_slide -->

Analogie de l'encapsulation : la boîte noire
==========================

Un distributeur de billets :

<!-- incremental_lists: true -->

- Vous savez **ce qu'il fait** : retirer de l'argent, vérifier le solde
- Vous ne savez pas **comment** il le fait en interne
- Vous ne pouvez pas modifier directement le solde de la banque
- Tout passe par une **interface définie** (l'écran, les boutons)

<!-- incremental_lists: false -->

<!-- pause -->

C'est ça, l'encapsulation. L'objet expose des **méthodes publiques**, parfois des attributs bien définis, mais protège son état interne. Il contrôle ce qui est accessible de l'extérieur.

<!-- end_slide -->

`private`, `public`, `protected`
==================================

On peut rajouter ces mots-clés devant n'importe quel attribut, ou méthode de la classe.

```typescript
class Character {
  public name: string        // accessible partout (par défaut)
  private hp: number         // accessible uniquement dans cette classe
  protected attackPower: number  // accessible dans cette classe ET ses enfants

  public isAlive() {
    return hp > 0
  }
}
```

<!-- pause -->

En pratique :

<!-- incremental_lists: true -->

- `public` → ce qu'on expose à l'extérieur : n'importe quel code peut appeler (méthode), lire ou modifier (attribut)
- `private` → l'attribut ou la méthode ne sont accessibles qu'à l'intérieur de la classe
- `protected` → pareil que private, mais accessible aussi aux classes enfants (avec l'héritage)

Par défaut, tous les attributs et méthodes sont publics.

<!-- incremental_lists: false -->

<!-- pause -->

> Ces mots-clés disparaissent à la compilation. En JS, tout redevient accessible. Mais TypeScript t'empêche de tricher pendant le développement.

<!-- end_slide -->

`readonly` : empêcher la modification
======================================

Parfois, un attribut n'a pas vocation à être modifié. On peut le marquer `readonly`.

```typescript
class Character {
  readonly name: string

  constructor(name: string) {
    this.name = name  // ✅ OK dans le constructeur
  }

  changeName(newName: string) {
    hero.name = newName // ❌ Erreur : name est readonly
  }
}
```

<!-- pause -->

`readonly` = assignable une seule fois, dans le constructeur. Après, c'est figé. Ici, `name` peut être public, mais on peut se prémunir de sa modification par le reste du code.

Utile pour les identifiants, les configurations, tout ce qui ne doit pas changer.

<!-- end_slide -->

Getters et setters
===================

Parfois, on veut qu'un attribut soit lisible à l'extérieur, mais modifiable que dans la classe. Dans ce cas il nous faudra combiner `private` + un "getter"

Un **getter** permet aussi de lire une valeur calculée comme si c'était un attribut (computed values).

Le code lit le getter comme un attribut (on utilise pas `hero.hp()` ici mais `hero.hp`), mais le code appelle la méthode pour avoir la valeur à jour.

```typescript
class Character {
  private _hp: number // convention: _ devant un attribut dénote un état privé

  get hp(): number { // on veut que le reste du code puisse lire hp
    return this._hp
  }

  get isAlive(): boolean { // aussi pratique pour des valeurs calculées
    return this._hp > 0
  }
}

console.log(hero._hp)       // TypeScript sera rouge, inaccessible
console.log(hero.hp)        // 80
console.log(hero.isAlive)   // true
```

<!-- end_slide -->

Setters : contrôler les modifications
======================================

On peut aussi souhaiter permettre la modification d'une valeur mais forcer le passage par une méthode, par exemple pour vérifier/valider la valeur avant d'accepter un état "corrompu".

Un **setter** permet de contrôler comment une valeur est modifiée. Il est appelé quand on tente d'assigner avec `=`.

```typescript
class Character {
  private _attackPower: number

  set attackPower(value: number) {
    if (value < 1) {
      this._attackPower = 1
    } else {
      this._attackPower = value
    }
  }
}

hero._attackPower = 5 // impossible en TypeScript
hero.attackPower = 5 // fonctionne comme attendu
hero.attackPower = -50  // en réalité, _attackPower sera mis à 1
```

<!-- pause -->

> Les getters/setters permettent d'exposer des "propriétés" tout en gardant le contrôle sur la lecture et l'écriture. Par défaut ils sont publics mais ils peuvent aussi être `protected` ou `private`.

<!-- end_slide -->

<!-- jump_to_middle -->

# 🛠️ Exercice 3

<!-- end_slide -->

Exercice 3 — Encapsulation
=============================

**Étape 1 — Encapsuler vos classes existantes**

Reprenez vos classes des exercices 1 et 2 et posez-vous ces questions :

- **Film / Réalisatrice** : Le titre, la date de sortie, le nom d'une réalisatrice peuvent-ils changer après création ?
- **Client** : Doit-on pouvoir faire `client.filmsEnLocation = []` directement ? Ou faut-il forcer le passage par `louerFilm()` ?
- **Croiseur** : Que se passe-t-il si on fait `croiseur.personnesABord = 10000` ? Comment forcer le passage par `charger()` qui vérifie la capacité ?
- **Intercepteur** : `nombreDeTirs` est un compteur interne. Doit-il être accessible de l'extérieur ?

> Ajoutez `public`, `private`, `protected` et/ou `readonly` lorsque ça fait sens.

<!-- pause -->

**Étape 2 — Ajouter une note à la classe `Film`**

- Ajoutez un attribut privé `_note`
- Ajoutez un **getter** `note` qui retourne la valeur
- Ajoutez un **setter** `note` qui vérifie que la note est entre 1 et 5 et assigne la valeur si elle est valide (sinon affiche une erreur)

```typescript
film.note = 4    // ✅ OK
console.log(film.note)  // 4
film.note = 10   // ❌ Erreur (note invalide)
```
