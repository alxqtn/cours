---
title: "User stories"
sub_title: Formuler un besoin utilisateur
theme:
  name: catppuccin-latte
---

<!-- end_slide -->

<!-- jump_to_middle -->
<!-- alignment: center -->

*T'as une fonctionnalité à construire.*

<!-- pause -->

**Est-ce que vous avez déjà entendu parler des user stories ?**
*(lever la main)*

<!-- pause -->

**À quoi ça sert, selon vous ?**

<!-- end_slide -->

Le problème
===========

Une liste de fonctionnalités :

- Système de notifications
- Import CSV des apprenantes
- Tableau de bord admin
- Gestion des permissions

<!-- pause -->

→ On sait **quoi** construire.
  On ne sait pas **ce qui compte**, ni **dans quel ordre**.

<!-- end_slide -->

Origine des user stories
==========================

<!-- pause -->

**Extreme Programming — Kent Beck, 1999**

<!-- pause -->

- User story écrite sur une carte index (fiche bristol)
- Tient dans la main → oblige à être concis
- La carte est une *promesse de conversation*, pas une spec complète

<!-- pause -->

→ Scrum — framework agile de gestion de projet — l'a adopté.
  Maintenant c'est partout.


<!-- end_slide -->

La structure
============

<!-- pause -->

**En tant que** `[qui ?]`

<!-- pause -->

**Je veux** `[quoi ?]`

<!-- pause -->

**Afin de** `[pourquoi ?]`

<!-- pause -->

> Pourquoi cet ordre ?

<!-- pause -->

On commence par **qui** → ça force à penser à l'utilisatrice,
pas à la feature. Le *quoi* et le *pourquoi* découlent du *qui*.


<!-- end_slide -->

La Card — juste un point de départ
====================================

<!-- pause -->

Une user story tient sur un Post-it.

C'est **fait exprès** — le format force la concision.

<!-- pause -->

> "En tant que formateurice, je veux voir les livrables
>  non rendus afin de relancer les apprenantes."

<!-- pause -->

Mais cette phrase ne dit pas :

- À quelle fréquence ?
- Quelle promo ?
- Que se passe-t-il quand tout est rendu ?


<!-- end_slide -->

La Conversation
================

<!-- pause -->

La story est un **point de départ**, pas une spec.

L'équipe doit répondre ensemble :

<!-- pause -->

- Cas limites ? *"Et si l'apprenante n'a pas encore créé de livrable ?"*
- Périmètre ? *"Toutes les semaines, ou juste la semaine courante ?"*
- Priorité ? *"Est-ce que c'est bloquant si ça arrive pas en V1 ?"*


<!-- end_slide -->

La Confirmation — Critères d'acceptation
==========================================

Comment on sait que la story est **finie** ?

<!-- pause -->

```
En tant que formateurice, je veux voir quelles apprenantes
n'ont pas rendu de livrable cette semaine afin de les relancer.

Critères d'acceptation :
- [ ] La liste s'affiche sur le dashboard formateurice
- [ ] Seules les apprenantes de ma promo apparaissent
- [ ] Une apprenante qui rend son livrable disparaît de la liste
- [ ] La liste est vide si tout le monde a rendu
```

> Une user story sans critères d'acceptation
> est une story qu'on ne peut pas livrer.

<!-- end_slide -->

Les 3 C's — Ron Jeffries, 2001
================================

<!-- pause -->

**Card** — tient sur un Post-it, déclenche la conversation

<!-- pause -->

**Conversation** — l'équipe répond aux questions ouvertes

<!-- pause -->

**Confirmation** — les critères d'acceptation définissent "fini"

<!-- end_slide -->

Qu'est-ce qui fait une bonne story ?
======================================

<!-- incremental_lists: true -->

- **I**ndependent — pas de dépendance forte à une autre story
- **N**egotiable — c'est un point de départ, pas un contrat
- **V**aluable — elle livre quelque chose à quelqu'un
- **E**stimable — l'équipe peut évaluer l'effort
- **S**mall — livrable dans un sprint
- **T**estable — on sait quand c'est fini

<!-- incremental_lists: false -->

*INVEST — Bill Wake, 2003*

<!-- speaker_note: Ces critères viennent naturellement des 3 pièges qu'on verra après. N = Négociable explique pourquoi c'est pas grave si c'est flou au départ — la conversation est attendue. -->


<!-- end_slide -->

Où vivent les stories ?
========================

<!-- pause -->

Les stories ne sont pas isolées. Elles vivent dans un **product backlog** :

<!-- pause -->

- **Épic** — grande fonctionnalité, trop grosse pour un sprint
  - **Story** — morceau livrable, faisable en quelques jours
    - **Tâche** — découpage technique, créé par l'équipe dev

<!-- pause -->

*Exemple :*

- Épic — Gestion des livrables
  - Story — Voir les retards par promo
    - Tâche — créer la query SQL
    - Tâche — créer le composant
  - Story — Envoyer un rappel
    - Tâche — intégrer l'email

<!-- speaker_note: Les tâches sont créées par l'équipe dev elle-même — elles n'ont pas besoin d'être des user stories. C'est un découpage technique, pas un besoin utilisateur. -->


<!-- end_slide -->

La partie la plus importante
============================

<!-- pause -->

Sans **afin de** → c'est une tâche de développement.

Avec **afin de** → c'est un besoin utilisateur.

<!-- pause -->

Le test :

> "Est-ce qu'une personne non-tech
>  comprend la valeur de cette fonctionnalité ?"


<!-- end_slide -->

Quelques exemples
=================

```
✅ En tant que voyageur
   je veux     recevoir une alerte quand le prix
               d'un vol baisse
   afin de     réserver au meilleur moment
```

<!-- pause -->

```
✅ En tant que livreur
   je veux     voir l'ordre de mes livraisons du jour
   afin de     optimiser mon trajet
```

<!-- pause -->

```
❌ En tant qu'utilisateur
   je veux     une meilleure interface
   afin de     utiliser l'app plus facilement
```
*(trop vague — impossible à estimer ou tester)*

<!-- pause -->

```
❌ En tant qu'admin
   je veux     configurer un cron job
               pour envoyer des emails
   afin de     notifier les utilisateurs
```
*(trop technique — décrit une solution, pas un besoin)*


<!-- end_slide -->

Quand les user stories ont leurs limites
=========================================

<!-- pause -->

Certains travaux n'ont pas d'utilisateur final direct :

<!-- pause -->

- Infrastructure, sécurité, performance
- Grandes entreprises avec des specs figées
- *"User story washing"* — le format devient un rituel vide

<!-- pause -->

> On peut très bien nommer un ticket autrement si c'est plus clair.


<!-- end_slide -->

D'autres formats utiles
========================

<!-- incremental_lists: true -->

- **Jobs to be done (JTBD)** — *"Quand [situation], je veux [motivation], pour [résultat]"* — centré sur le contexte déclencheur

- **BDD / Gherkin** — *"Given / When / Then"* — critères d'acceptation automatisés

- **Spike** — ticket d'exploration, pas une livraison de valeur

- **Bug report** — comportement attendu / observé / steps to reproduce

- **Titre descriptif simple** — *"Ajouter la pagination sur la liste des apprenantes"* — parfois suffisant

<!-- incremental_lists: false -->

<!-- speaker_note: L'important c'est pas le format, c'est la clarté. Une user story mal écrite vaut moins qu'un titre clair. Le format est un outil, pas une religion. -->


<!-- end_slide -->

Les 3 pièges
============

<!-- incremental_lists: true -->

- **Trop technique** — décrit une solution, pas un besoin
  *"je veux un endpoint POST /users afin de créer des comptes"*

- **Pas de « afin de »** — on sait quoi faire, pas pourquoi
  *"En tant qu'apprenante, je veux modifier mon profil."*

- **Trop vague** — impossible à développer ou tester
  *"afin que l'app soit bien faite"*

<!-- incremental_lists: false -->

<!-- end_slide -->

<!-- jump_to_middle -->
<!-- alignment: center -->

## Analyse collective

7 user stories — bonne, mauvaise, ou à améliorer ?


<!-- end_slide -->

Story 1 — Trouvaille
====================

> En tant que vendeur, je veux **mettre mes affaires en vente**
> afin de **gagner de l'argent**.

Bonne user story ?

<!-- pause -->

❌ **Trop vague** — "mettre en vente" ne dit pas quoi construire.
Prix ? Photos ? Catégorie ? Impossible à estimer ou tester.

→ *"En tant que vendeur, je veux publier une annonce avec
titre, description et prix afin que des acheteurs puissent
trouver et contacter mon article."*


<!-- end_slide -->

Story 2 — Trouvaille
====================

> En tant qu'acheteur, je veux **un GET /listings?sort=price**
> afin d'**accéder aux annonces triées**.

Bonne user story ?

<!-- pause -->

❌ **Trop technique** — décrit un endpoint d'API, pas un besoin
utilisateur. On a décidé du "comment" avant même de formuler
le "quoi".

→ *"En tant qu'acheteur, je veux trier les annonces par prix
afin de trouver rapidement ce qui rentre dans mon budget."*


<!-- end_slide -->

Story 3 — Trouvaille
====================

> En tant qu'acheteur, je veux **voir les photos d'un article**.

Bonne user story ?

<!-- pause -->

❌ **Pas de « afin de »** — on sait quoi faire, pas pourquoi.
Sans valeur identifiée, impossible de prioriser ou de négocier.

→ *"En tant qu'acheteur, je veux voir les photos d'un article
afin d'évaluer son état avant de contacter le vendeur."*


<!-- end_slide -->

Story 4 — Trouvaille
====================

> En tant que vendeur, je veux **être notifié dès qu'une offre
> arrive** afin de **répondre rapidement**.

Bonne user story ?

<!-- pause -->

✅ **Bien écrite** — qui, quoi, pourquoi : tous clairs et concrets.
Non technique. La valeur est orientée action ("répondre").
Testable : soit la notif arrive dès la réception d'une offre, soit non.


<!-- end_slide -->

Story 5 — Trouvaille
====================

> En tant que vendeur, je veux **être averti**
> afin d'**être content**.

Bonne user story ?

<!-- pause -->

❌ **« Afin de » vide de sens** — "être content" n'est pas
une valeur métier. Non testable. Et "être averti" de quoi ?

→ *"En tant que vendeur, je veux recevoir un email quand
mon annonce est mise en favori afin de savoir si elle
intéresse des acheteurs."*

<!-- end_slide -->

Story 6 — Trouvaille
====================

> En tant qu'admin, je veux **créer, modifier, suspendre et
> bannir des comptes, modérer les annonces et envoyer des
> alertes de sécurité** afin de **gérer la plateforme**.

Bonne user story ?

<!-- pause -->

❌ **Trop grosse** — 6 fonctionnalités dans une story.
Inestimable. Indélivrable dans un sprint.
Le "afin de" est lui-même vague.

→ À découper : créer un compte / suspendre un compte /
bannir un compte / modérer une annonce / envoyer une alerte —
chacune a sa propre valeur et peut être livrée séparément.

<!-- end_slide -->

Story 7 — Trouvaille
====================

> En tant qu'acheteur, je veux **filtrer par distance**
> afin de **ne voir que les articles récupérables
> près de chez moi**.

Bonne user story ?

<!-- pause -->

✅ **Bien écrite** — valeur précise et honnête (pas "pour trouver
des articles", mais "récupérables près de chez moi").
Non technique. Testable.

À noter : la précision du "afin de" dit quelque chose sur
l'utilisateur réel — pas un objectif générique.

<!-- end_slide -->

<!-- jump_to_middle -->
<!-- alignment: center -->

À vous — Temps 3

Prenez 2 à 3 fonctionnalités de votre V1.
**Transformez-les en user stories.**

*Pas de jargon technique. Obligation d'avoir un "afin de".*

<!-- end_slide -->
