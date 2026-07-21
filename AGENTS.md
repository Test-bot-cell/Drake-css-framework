# Règles de contribution assistée

## Statut

Ce fichier est normatif pour l’ensemble du dépôt. Il s’applique aux personnes, aux agents
automatisés et aux scripts qui proposent une modification.

Les mots **DOIT**, **NE DOIT PAS**, **DEVRAIT**, **NE DEVRAIT PAS** et **PEUT** expriment le
niveau d’obligation. En cas de contradiction interne au dépôt, l’ordre de priorité est :

1. `docs/fork/CHARTER.md` ;
2. les décisions acceptées dans `docs/fork/DECISIONS.md` ;
3. le présent fichier ;
4. `docs/fork/DEVELOPMENT.md`, `docs/fork/ICON_MIGRATION.md`,
   `docs/fork/MOBILE_FIRST_SEO.md` et `docs/fork/UPSTREAM.md` ;
5. `docs/fork/ROADMAP.md` et `FORK.md`.

Une consigne explicite du mainteneur pour une tâche précise peut réduire le périmètre d’une
intervention, mais elle ne modifie pas silencieusement la charte.

## Mission du dépôt

Le dépôt maintient un fork traçable de UIkit 3.25.20 dont :

- le code source du runtime navigateur est exclusivement en TypeScript strict ;
- la compatibilité de balisage, de styles, de comportements et d’API UIkit est protégée ;
- toutes les icônes UIkit livrées sont remplacées par Tabler Icons Outline 3.45.0 en CSS ;
- la police par défaut est Inter 4.1 variable, roman et italic, générée en CSS ;
- le HTML rendu côté serveur ou prérendu reste complet, navigable et indexable sans runtime ;
- les styles et composants suivent une conception mobile-first à partir de 320 pixels CSS ;
- les artefacts sont reproductibles, auditables, accessibles et légalement redistribuables.

## Invariants non négociables

### Langage du runtime

- Toute source destinée à être exécutée dans un navigateur **DOIT** être écrite en
  TypeScript strict. Aucun fichier JavaScript source navigateur, historique ou nouveau,
  **NE DOIT** subsister dans l'arbre publiable.
- Un module JavaScript amont **DOIT** être porté en TypeScript avant son intégration ; une
  coexistence JavaScript/TypeScript, même temporaire, n'est pas une stratégie conforme.
- Les scripts de build Node.js **PEUVENT** rester en JavaScript lorsqu’ils ne sont pas livrés
  comme runtime navigateur.
- Le build TypeScript **DOIT** produire du JavaScript consommable par les navigateurs. La
  présence de JavaScript compilé dans `dist/` est indispensable et n’est pas une dérogation ;
  aucun autre JavaScript navigateur ne peut être distribué hors de `dist/`.
- `allowJs` **NE DOIT PAS** couvrir le runtime navigateur et un bundle de test exécuté dans
  un navigateur **DOIT** lui aussi provenir de sources TypeScript.
- Elm **NE DOIT PAS** entrer dans le cœur du runtime, le build principal ni le contrat public.
  Un adaptateur Elm futur **PEUT** être étudié comme paquet séparé après stabilisation du fork.

### HTML d'abord et amélioration progressive

- Toute page d'exemple, tout gabarit recommandé et toute intégration déclarée conforme
  **DOIT** livrer dans la réponse HTTP ou le HTML prérendu l'intégralité du contenu, de la
  navigation, des liens, des titres, des métadonnées et des données structurées utiles.
- Le TypeScript navigateur **DOIT** être une amélioration progressive non bloquante. Sans
  JavaScript, le contenu principal reste lisible, les liens restent navigables et les
  contrôles essentiels conservent un repli HTML natif.
- Un app shell vide, une route accessible uniquement côté client, un contenu principal
  injecté après interaction ou un `<noscript>` utilisé comme substitut au HTML initial sont
  interdits.
- Les liens explorables **DOIVENT** utiliser des éléments `<a>` avec un `href` réel. Un
  gestionnaire TypeScript **PEUT** enrichir leur comportement sans supprimer leur destination.
- Le serveur **DOIT** retourner un statut HTTP conforme à la ressource (`2xx`, redirection
  `3xx`, `404`, `410`, authentification, etc.) ; un écran d'erreur rendu avec `200` est
  non conforme.

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
- Les anciennes icônes UIkit **DOIVENT** être remplacées dans chaque composant par des
  classes ou alias CSS Tabler. Aucun registre de glyphes SVG, bundle `uikit-icons.js`, objet
  de chemins SVG ou injection d'icône par le runtime **NE DOIT** être distribué.
- Une icône décorative **DOIT** être masquée aux technologies d'assistance ; une icône porteuse
  de sens **DOIT** recevoir un nom accessible indépendant du masque CSS.
- « Icônes en CSS » ne signifie pas « absence de données SVG » : les données de tracé
  intégrées à la CSS sont autorisées et nécessaires.
- L’espace de noms public **DOIT** rester `.uk-ti` pour la classe de base et
  `.uk-ti-{nom}` pour une icône. Son changement exige une décision formelle et une
  migration.
- Les alias historiques, les divergences de marques et le remplacement de
  `UIkit.icon.add` **DOIVENT** suivre `docs/fork/ICON_MIGRATION.md`.

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

### Mobile-first et SEO technique

- La feuille de style de base **DOIT** fonctionner à 320 pixels CSS sans défilement
  horizontal bidirectionnel, hors contenu qui l'exige intrinsèquement au sens de WCAG.
- Les adaptations de mise en page **DOIVENT** enrichir cette base avec des media queries
  `min-width`. Les media queries de préférences utilisateur, d'impression ou de capacités
  ne sont pas concernées par cette règle de direction.
- Mobile et bureau **DOIVENT** exposer le même contenu, les mêmes titres, métadonnées,
  données structurées, textes alternatifs et actions ; seule la présentation peut évoluer.
- Chaque cible interactive **DOIT** atteindre au moins 24 par 24 pixels CSS, ou respecter
  l'exception d'espacement WCAG 2.2 documentée et testée.
- Chaque document conforme **DOIT** fournir au minimum un `<title>` descriptif, une meta
  description, une URL canonique cohérente, des directives robots intentionnelles, une
  hiérarchie de titres sémantique, des images dimensionnées avec texte alternatif approprié
  et les données structurées utiles au contenu.
- La performance **DOIT** être suivie sur mobile et bureau. Les objectifs de référence au
  75e percentile sont LCP inférieur ou égal à 2,5 s, INP inférieur ou égal à 200 ms et CLS
  inférieur ou égal à 0,1 ; une régression inexpliquée bloque la release.
- `docs/fork/MOBILE_FIRST_SEO.md` définit les critères détaillés et leurs sources. Une
  optimisation SEO ne peut ni masquer du contenu ni dégrader l'accessibilité.

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
- `src/scss/` et `dist/` sont générés et **NE DOIVENT PAS** être modifiés manuellement.
- La sortie historique `tests/js/test.js` **DOIT** être supprimée : les tests navigateur ont
  des sources TypeScript et leurs éventuels bundles compilés vivent sous `dist/`.
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
- contrôle automatisé de l'absence de JavaScript source navigateur et de registre SVG JS ;
- tests sans JavaScript du HTML, des liens, métadonnées et statuts HTTP ;
- tests de reflow à 320 pixels CSS, de cibles tactiles et de parité mobile/bureau ;
- budget de performance et contrôle des Core Web Vitals applicables ;
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
- ajouter ou conserver une source JavaScript destinée au navigateur ;
- réintroduire un plugin, registre ou bundle d'icônes SVG distribué ;
- rendre le contenu, la navigation, les métadonnées ou les données structurées dépendants du
  runtime navigateur ;
- écrire une mise en page desktop-first corrigée ensuite par des media queries `max-width` ;
- servir un contenu primaire différent sur mobile et bureau ;
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
