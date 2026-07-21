# Règles de contribution assistée

## Statut

Ce fichier est normatif pour l’ensemble du dépôt. Il s’applique aux personnes, aux agents
automatisés et aux scripts qui proposent une modification.

Les mots **DOIT**, **NE DOIT PAS**, **DEVRAIT**, **NE DEVRAIT PAS** et **PEUT** expriment le
niveau d’obligation. En cas de contradiction interne au dépôt, l’ordre de priorité est :

1. `docs/fork/CHARTER.md` ;
2. les décisions acceptées dans `docs/fork/DECISIONS.md` ;
3. le présent fichier ;
4. `docs/fork/DEVELOPMENT.md` et `docs/fork/UPSTREAM.md` ;
5. `docs/fork/ROADMAP.md` et `FORK.md`.

Une consigne explicite du mainteneur pour une tâche précise peut réduire le périmètre d’une
intervention, mais elle ne modifie pas silencieusement la charte.

## Mission du dépôt

Le dépôt maintient un fork traçable de UIkit 3.25.20 dont :

- le code source du runtime navigateur migre vers TypeScript strict ;
- la compatibilité de balisage, de styles, de comportements et d’API UIkit est protégée ;
- le catalogue d’icônes est Tabler Icons Outline 3.45.0, généré en CSS ;
- la police par défaut est Inter 4.1 variable, roman et italic, générée en CSS ;
- les artefacts sont reproductibles, auditables, accessibles et légalement redistribuables.

## Invariants non négociables

### Langage du runtime

- Toute logique nouvelle ou substantiellement modifiée dans le runtime navigateur **DOIT**
  être écrite en TypeScript.
- Les fichiers JavaScript historiques **PEUVENT** cohabiter temporairement avec TypeScript
  pendant la migration, mais leur surface **NE DOIT PAS** augmenter.
- Les scripts de build Node.js **PEUVENT** rester en JavaScript lorsqu’ils ne sont pas livrés
  comme runtime navigateur.
- Le build TypeScript **DOIT** produire du JavaScript consommable par les navigateurs. La
  présence de JavaScript généré dans `dist/` n’est pas une dérogation.
- Elm **NE DOIT PAS** entrer dans le cœur du runtime, le build principal ni le contrat public.
  Un adaptateur Elm futur **PEUT** être étudié comme paquet séparé après stabilisation du fork.

### Compatibilité UIkit

- Les attributs `uk-*` et `data-uk-*`, les classes `uk-*`, les événements DOM, le cycle de vie
  automatique et l’API globale `UIkit` forment le contrat de compatibilité.
- Une conversion de langage **NE DOIT PAS** modifier le comportement observable dans le même
  changement.
- Toute incompatibilité intentionnelle **DOIT** être documentée, testée, assortie d’une
  migration et acceptée dans `docs/fork/DECISIONS.md` avant intégration.
- L’accessibilité, le clavier, le focus, le mode RTL et les mutations dynamiques du DOM sont
  des comportements contractuels, pas des améliorations facultatives.

### Icônes

- La version autorisée est exactement `@tabler/icons@3.45.0`.
- Les 5 112 icônes du catalogue **Outline** sont autorisées, y compris les icônes
  `brand-*` présentes dans ce catalogue. Les variantes filled et les icônes provenant d’une
  autre version sont exclues du catalogue généré.
- La sortie canonique est `dist/css/uikit-tabler-icons.css`.
- Les tracés **DOIVENT** être intégrés aux règles CSS sous forme de données
  `data:image/svg+xml` encodées et utilisées par `mask` et `-webkit-mask`.
- Aucun fichier ou asset Tabler `.svg` autonome **NE DOIT** être copié dans `dist/` ni dans un
  paquet publié.
- « Icônes en CSS » ne signifie pas « absence de données SVG » : les données de tracé
  intégrées à la CSS sont autorisées et nécessaires.
- L’espace de noms public **DOIT** rester `.uk-ti` pour la classe de base et
  `.uk-ti-{nom}` pour une icône. Son changement exige une décision formelle et une
  migration.

### Typographie

- La version autorisée est Inter 4.1 officielle.
- Les deux faces variables roman et italic **DOIVENT** être présentes, sans sous-ensemblage.
- La sortie canonique est `dist/css/uikit-inter.css`.
- Les deux fontes WOFF2 **DOIVENT** être intégrées à cette CSS sous forme de `data:` URI.
- Aucun fichier `.woff` ou `.woff2` autonome **NE DOIT** être présent dans `dist/` ni dans un
  paquet publié.
- « Police en CSS » ne signifie pas « autre format interne » : les octets WOFF2 intégrés à la
  CSS sont autorisés.
- Les fichiers de fonte **NE DOIVENT PAS** être modifiés ou sous-ensemblés sous le nom
  réservé « Inter ». Toute fonte dérivée exige un autre nom et un amendement formel.

### Licences et provenance

- La licence MIT et les mentions de UIkit **DOIVENT** être conservées.
- La licence MIT de Tabler Icons 3.45.0 **DOIT** être conservée et attribuée dans les sorties
  ou notices applicables.
- La licence SIL Open Font License 1.1 d’Inter 4.1 **DOIT** être conservée.
- `THIRD_PARTY_NOTICES.md` et les textes sous `licenses/` **DOIVENT** être distribués avec
  les sources et rester cohérents avec les bannières générées.
- Les bannières de licence essentielles **DOIVENT** survivre à la minification.
- Une dépendance, une ressource ou un générateur sans version et provenance vérifiables
  **NE DOIT PAS** entrer dans une release.

## Sources canoniques et fichiers générés

- `src/less/` est la source canonique des styles UIkit.
- `src/scss/`, `dist/` et `tests/js/test.js` sont générés et **NE DOIVENT PAS** être modifiés
  manuellement.
- Les CSS Tabler et Inter sont des sorties de générateurs ; elles **NE DOIVENT PAS** recevoir
  de correction manuelle.
- Une modification d’un artefact généré **DOIT** être faite dans sa source ou son générateur,
  suivie d’une régénération complète et d’un contrôle de diff.

## Discipline TypeScript

- Le contrôle TypeScript strict **DOIT** réussir sans émission avant fusion.
- `any`, `@ts-ignore`, les assertions doubles et les types volontairement vagues
  **NE DOIVENT PAS** servir à faire taire une erreur.
- Une exception réellement indispensable **DOIT** être locale, commentée, reliée à une dette
  explicite et assortie d’un critère de suppression.
- Le système dynamique de composants **DOIT** être modélisé par des types centraux pour les
  props, données, computed, méthodes, hooks, événements, mixins et extensions.
- esbuild est un transpileur dans ce dépôt ; son succès **NE REMPLACE PAS** `tsc --noEmit`.
- Les changements mécaniques de renommage, les ajouts de types et les changements de
  comportement **DEVRAIENT** être séparés en commits distincts.

## Procédure avant toute modification

1. Lire `FORK.md` et les documents applicables sous `docs/fork/`.
2. Examiner `git status` et préserver les modifications qui ne relèvent pas de la tâche.
3. Classer le changement : ordinaire, sensible ou constitutionnel.
4. Identifier les surfaces de compatibilité et les artefacts générés concernés.
5. Travailler sur une branche courte issue de `fork/main` ou de la branche d’intégration
   explicitement désignée.
6. Limiter le diff à la tâche et éviter tout reformatage opportuniste.

## Contrôles avant livraison

Selon le périmètre, la contribution **DOIT** exécuter les gates définies dans
`docs/fork/DEVELOPMENT.md`. Au minimum :

- lint ;
- contrôle TypeScript sans émission ;
- compilation normale et RTL ;
- contrôle des assets si les ressources, le packaging ou le CSS changent ;
- tests de compatibilité ciblés ;
- vérification que la régénération ne laisse aucun diff inexpliqué.

Un contrôle non exécuté **DOIT** être signalé avec sa raison. Il ne peut pas être déclaré
réussi par supposition.

## Interdictions opérationnelles

Une contribution **NE DOIT PAS** :

- pousser vers le remote `upstream` ;
- réécrire l’historique partagé ou déplacer un tag amont ;
- fusionner directement une mise à jour amont dans `fork/main` ;
- modifier manuellement un fichier généré ;
- mettre à jour UIkit, Tabler, Inter, TypeScript, Node ou pnpm de manière opportuniste ;
- ajouter une dépendance runtime pour contourner une difficulté de migration ;
- réintroduire le plugin d’icônes SVG distribué comme mécanisme principal ;
- charger les icônes ou fontes depuis un CDN à l’exécution ;
- réduire un test ou une exigence d’accessibilité afin de faire passer une modification.

## Amendement des règles

Un invariant ne peut être modifié que par un amendement explicite :

1. décrire le problème et les alternatives ;
2. identifier les compatibilités, licences, tailles, risques et migrations affectés ;
3. modifier `CHARTER.md` et/ou ajouter une décision dans `DECISIONS.md` ;
4. obtenir l’acceptation explicite du mainteneur ;
5. seulement ensuite intégrer l’implémentation.

Une modification de code ne constitue jamais, à elle seule, un amendement implicite.

## Compte rendu attendu

Toute livraison **DOIT** préciser :

- les fichiers modifiés ;
- le contrat préservé ou volontairement modifié ;
- les gates exécutées et leur résultat ;
- les risques ou travaux restant ouverts ;
- les artefacts supprimés, régénérés ou ajoutés.
