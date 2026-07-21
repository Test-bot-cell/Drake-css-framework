# Cycle de développement

## 1. Objet

Ce document définit le cycle normal d’une modification, les gates obligatoires et la
définition de « terminé ». Il complète la charte sans l’assouplir.

## 2. Environnement officiel

La chaîne de référence est :

- Node.js 24.18.0 exact ;
- pnpm 11.4.0 ;
- installation depuis le lockfile avec `pnpm install --frozen-lockfile` ;
- navigateur(s) de validation compatibles avec la cible maintenue par le build.

Une autre version locale peut servir à explorer un problème, mais ses résultats ne suffisent
pas à valider une contribution.

## 3. Branches et commits

- `fork/main` est la branche stable et doit toujours rester publiable au regard des gates
  déjà atteints par la feuille de route.
- Une modification ordinaire utilise une branche courte : `feat/*`, `fix/*`, `refactor/*`,
  `test/*`, `docs/*` ou `chore/*`.
- Une intégration amont utilise `sync/uikit-vX.Y.Z` et suit `UPSTREAM.md`.
- Une branche ne doit pas mélanger synchronisation amont, conversion TypeScript, changement
  d’asset et redesign.

Les commits **DEVRAIENT** être atomiques et suivre les préfixes amont :
`build:`, `chore:`, `ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`, `style:` ou
`test:`.

## 4. Cycle d’une modification

### Étape 1 — Classer

Le contributeur identifie :

- le besoin vérifiable ;
- la catégorie ordinaire, sensible ou constitutionnelle ;
- les surfaces C0 à C3 concernées ;
- les sources canoniques et sorties générées touchées ;
- les licences ou versions épinglées éventuellement affectées.
- l'impact HTML initial, mobile-first, SEO, accessibilité et Core Web Vitals.

Un changement constitutionnel s’arrête ici jusqu’à acceptation d’un amendement.

### Étape 2 — Établir la référence

Avant de modifier le code :

- relever `git status` ;
- exécuter ou documenter le test qui caractérise l’état actuel ;
- conserver un exemple minimal de la régression ou du comportement ;
- identifier l’équivalent dans UIkit 3.25.20 pour un changement de compatibilité.
- capturer le HTML avant runtime et caractériser le comportement sans JavaScript lorsque le
  composant expose du contenu, une navigation ou une action essentielle.

### Étape 3 — Implémenter au bon niveau

- Modifier `src/less/` pour les styles UIkit.
- Modifier les générateurs pour les CSS Tabler ou Inter.
- Modifier exclusivement le TypeScript pour le runtime navigateur.
- Lorsqu’un fichier runtime JavaScript amont doit évoluer, porter le module complet vers
  TypeScript dans un changement comportementalement neutre avant ou séparément de l’évolution.
  Ne jamais introduire de coexistence JavaScript/TypeScript.
- Rendre le contenu et la navigation dans le HTML serveur ou prérendu ; réserver le
  TypeScript à l'amélioration progressive.
- Écrire la mise en page de base pour 320 pixels CSS, puis les enrichissements avec
  `min-width`.
- Ne jamais corriger directement `src/scss/` ou `dist/`. Supprimer la sortie historique
  `tests/js/test.js` en portant ses sources en TypeScript et sa sortie sous `dist/`.

### Étape 4 — Tester au plus près

Le test le plus petit qui reproduit le comportement est ajouté ou mis à jour. Pour un
composant interactif, il couvre selon le cas :

- création par attribut et par API ;
- ajout, retrait et reconnexion dans le DOM ;
- options initiales et mutation d’attribut ;
- souris, tactile et clavier ;
- focus, rôles, noms et états ARIA ;
- LTR et RTL ;
- réduction de mouvement ou autres préférences pertinentes ;
- exécution désactivée : contenu, liens et actions essentielles ;
- reflow à 320 pixels CSS, cibles tactiles et parité mobile/bureau ;
- HTML initial, métadonnées, données structurées et statuts HTTP lorsque applicables ;
- impact LCP, INP et CLS ou leurs mesures de laboratoire applicables ;
- destruction sans listener, observer ou nœud résiduel.

### Étape 5 — Exécuter les gates

Les gates applicables sont exécutés dans l’ordre de la section 8. Une erreur est corrigée à
sa source ; un test ou un contrôle n’est pas neutralisé pour obtenir un résultat vert.

### Étape 6 — Relire le diff

Avant livraison :

- distinguer sources et sorties générées ;
- rechercher un changement hors périmètre ;
- vérifier les bannières de licence ;
- confirmer l’absence de fichiers `.svg` Tabler et `.woff`/`.woff2` autonomes distribués ;
- confirmer l'absence de source JavaScript navigateur et de registre SVG JavaScript ;
- relire le HTML sans runtime, la cascade mobile-first et les signaux SEO applicables ;
- exécuter un second build et vérifier l’absence de diff inexpliqué.

### Étape 7 — Documenter

Le compte rendu indique le contrat concerné, les gates exécutés, les divergences connues et
les décisions éventuellement ajoutées.

## 5. Migration TypeScript

### 5.1 Principe

Le port est découpé en unités de revue, mais aucun état publiable ne permet la coexistence de
sources JavaScript et TypeScript pour le navigateur. Un module historique est converti en
entier avant d'être modifié. esbuild produit le JavaScript compilé exclusivement sous
`dist/`, et `tsc --noEmit` est l’autorité de type.

Le dépôt **DOIT** activer les options compatibles avec la compilation isolée par esbuild,
notamment `isolatedModules`. Les imports de types doivent être explicites et `allowJs` ne
doit pas inclure le runtime navigateur.

### 5.2 Modèle de composants

Avant une conversion massive, des types centraux **DOIVENT** représenter :

- props et constructeurs de coercition ;
- data initiale ;
- computed et watchers ;
- méthodes et leur `this` ;
- hooks de cycle de vie ;
- événements, observers et updates ;
- mixins, `extends` et composants fonctionnels ;
- instance attachée au nœud DOM.

Des helpers du type `defineComponent` et `defineMixin` **DEVRAIENT** fournir le contexte
`ThisType` et composer les interfaces. Une conversion qui remplace cette modélisation par
`Record<string, any>` n’est pas conforme.

### 5.3 Ordre de migration

L’ordre recommandé est :

1. configuration TypeScript-only et gate d'absence de source JavaScript navigateur ;
2. `src/js/util/`, des fonctions pures vers les utilitaires DOM ;
3. `src/js/api/` : état, options, props, cycle de vie, boot et scheduler ;
4. mixins transverses ;
5. composants core simples ;
6. groupes à état partagé :
    - modal, offcanvas, lightbox et tooltip ;
    - slider, slideshow et parallax ;
    - drop, dropdown et dropnav ;
    - sticky, sortable et upload ;
7. composants optionnels et entrées de bundle ;
8. types publics et sortie ESM additionnelle ;
9. suppression de toute entrée, fixture ou bundle navigateur historique hors de `dist/`.

Les ports peuvent être livrés par lots cohérents, mais un module TypeScript **NE DOIT PAS**
importer un doublon JavaScript navigateur. Une phase n’est close que lorsque ses tests, son
typecheck et l'audit des sources sont verts.

### 5.4 Séparation des changements

Un commit de conversion :

- conserve les exports, chemins logiques et noms publics ;
- ne change ni algorithme, ni valeur par défaut, ni CSS ;
- ne remplace pas une API dynamique par une nouvelle abstraction runtime ;
- produit un bundle dont le comportement est caractérisé contre la référence.

Les corrections découvertes pendant la conversion sont faites dans un commit séparé avec un
test d’échec.

## 6. Développement des assets

### 6.1 Tabler

`@tabler/icons` reste une dépendance de développement épinglée à 3.45.0. Le générateur :

- lit l’intégralité des 5 112 icônes Outline, `brand-*` incluses ;
- exclut les variantes filled ;
- normalise et percent-encode les tracés ;
- produit `dist/css/uikit-tabler-icons.css` ;
- génère la classe de base `.uk-ti` et les classes `.uk-ti-{nom}` ;
- conserve la bannière MIT ;
- ne copie aucun fichier SVG dans la distribution.
- produit les alias de compatibilité nécessaires pour les anciennes icônes UIkit exclusivement
  en CSS ;
- remplace les icônes internes sans registre, bundle ou injection SVG JavaScript.

Un changement de tri doit produire une sortie déterministe.
La migration des consommateurs et les divergences d’alias suivent `ICON_MIGRATION.md`.

### 6.2 Inter

Le générateur Inter :

- part des deux fichiers officiels 4.1 intacts, roman et italic ;
- vérifie leur empreinte ;
- les encode dans deux règles `@font-face` de `dist/css/uikit-inter.css` ;
- configure Inter comme police par défaut du framework à la source Less ;
- conserve la notice SIL OFL 1.1 ;
- ne copie aucun fichier WOFF ou WOFF2 autonome dans la distribution.

Le sous-ensemblage, la modification des contours ou le renommage sont hors cycle ordinaire.

### 6.3 Commandes

Les points d’entrée attendus sont :

    pnpm build-icons-css
    pnpm build-inter-css
    pnpm build-assets
    pnpm check-assets

La CSS générée n’est jamais éditée à la main.

### 6.4 Validation locale complète

La commande canonique avant revue est :

    pnpm verify

Elle contrôle le formatage, exécute le lint JavaScript/TypeScript et le typecheck strict sans
émission, puis la génération SCSS et des assets CSS, les builds LTR/RTL, les contrôles
d’assets et les gates frontend dans Chrome aux largeurs 320 et 1 440 pixels. Le serveur
utilisé par ce dernier contrôle écoute uniquement sur une adresse locale et est arrêté après
la mesure.

La reproductibilité G9 reste un contrôle séparé : repartir d’un arbre Git propre, exécuter
`pnpm verify` une seconde fois, puis exiger un `git diff --exit-code` vide.

Les seuils, viewports et allowlists sont versionnés dans `tests/fixtures/`. Les mesures Chrome
propres à une machine (`*.metrics.json`) et les rapports détaillés de `reports/` sont des preuves
locales régénérées et ignorées par Git : leurs temps bruts ne sont pas bit-à-bit reproductibles.
G9 porte sur les sources et artefacts déterministes suivis, tandis que G13 réévalue les budgets à
chaque exécution.

Pendant le développement, `pnpm watch` maintient en parallèle les bundles issus des sources
TypeScript et la CSS compilée depuis Less. Le watcher ne remplace jamais `pnpm verify` : il
privilégie la vitesse, ne minifie pas le runtime et ne lance pas les gates navigateur.

## 7. Matrice de tests de compatibilité

Les pages de `tests/` constituent le catalogue historique. Elles doivent être validées au
minimum dans les modes suivants pour une release candidate :

| Axe           | Cas minimaux                                                                      |
| ------------- | --------------------------------------------------------------------------------- |
| Direction     | LTR et RTL                                                                        |
| Entrée        | souris, clavier et tactile lorsque pertinent                                      |
| Cycle DOM     | présent au chargement, ajouté, retiré, reconnecté                                 |
| API           | attribut, initialisation programmatique, destruction                              |
| Accessibilité | focus, nom, rôle, état, ordre clavier                                             |
| Responsive    | petit et grand viewport, resize                                                   |
| Assets        | icône courante, `brand-*` Outline, roman, italic                                  |
| Sans runtime  | HTML, contenu, liens, navigation et replis natifs                                 |
| Mobile-first  | reflow 320 px, zoom 400 %, cibles et enrichissements `min-width`                  |
| SEO           | metadata, canonical, robots, statuts, href, titres, images et données structurées |
| Performance   | LCP, CLS, proxy INP en laboratoire et données terrain disponibles                 |

La comparaison visuelle ne remplace pas les assertions de comportement et d’accessibilité.

## 8. Gates

| Gate                   | Commande ou preuve                                                                            | Bloquant pour                   |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| G0 — Périmètre         | `git status` et diff relu                                                                     | toute contribution              |
| G1 — Dépendances       | `pnpm install --frozen-lockfile` sous Node.js 24.18.0                                         | build et release                |
| G2 — Lint              | `pnpm exec eslint .`                                                                          | code et scripts                 |
| G3 — Types             | `pnpm exec tsc --noEmit`                                                                      | runtime TypeScript              |
| G4 — Build             | `pnpm compile`                                                                                | code, styles et release         |
| G5 — RTL               | `pnpm compile-rtl`                                                                            | styles, composants et release   |
| G6 — Assets            | `pnpm build-assets` puis `pnpm check-assets`                                                  | assets, packaging et release    |
| G7 — Compatibilité     | tests ciblés puis catalogue `tests/` LTR/RTL                                                  | runtime et release              |
| G8 — Légal             | versions, empreintes et notices contrôlées                                                    | assets et release               |
| G9 — Reproductibilité  | second build puis `git diff --exit-code`                                                      | release                         |
| G10 — Sources frontend | audit automatisé : TypeScript source uniquement, JavaScript navigateur seulement dans `dist/` | runtime et release              |
| G11 — HTML et SEO      | HTML HTTP/prérendu, sans runtime, statuts, liens, métadonnées et données structurées          | composants, exemples et release |
| G12 — Mobile-first     | reflow 320 px/400 %, cibles, LTR/RTL et parité mobile/bureau                                  | styles, composants et release   |
| G13 — Performance      | comparaison LCP/CLS/TBT laboratoire et revue LCP/INP/CLS terrain disponible                   | composants et release           |
| G14 — Icônes héritées  | aucun registre SVG JS ; toutes les icônes livrées résolues vers Tabler CSS                    | assets, composants et release   |

Un changement documentaire seul exécute G0 et une revue de cohérence. Il n’a pas à
régénérer les artefacts s’il ne modifie aucune règle consommée par un générateur.

## 9. Définition de terminé

Une modification est terminée lorsque :

- son besoin et son périmètre sont explicites ;
- sa source canonique, et non sa sortie, a été modifiée ;
- elle possède les tests proportionnés au risque ;
- tous les gates applicables sont verts ;
- les sorties sont déterministes ;
- la compatibilité est préservée ou la divergence est acceptée et documentée ;
- le HTML initial reste complet, indexable et utilisable sans runtime ;
- le reflow mobile-first, le SEO technique et les budgets de performance applicables sont
  démontrés ;
- les licences sont intactes ;
- aucun commentaire `TODO` non suivi ni contournement de type n’est ajouté ;
- le compte rendu permet à une autre personne de reproduire la validation.

## 10. Préparation d’une release

Les scripts de publication de l’amont sont volontairement absents : aucun automatisme local ne
doit pousser vers `uikit/uikit`, `main`, `develop` ou créer une release GitHub. Tant qu’un nom de
paquet, un dépôt distant et une autorité de publication propres au fork n’ont pas été décidés, le
manifeste reste privé et la préparation s’arrête à un paquet local audité.

Une release candidate exige en plus :

1. checkout propre depuis `fork/main` ;
2. installation gelée sous la chaîne officielle ;
3. suite complète des gates G1 à G14 ;
4. validation du catalogue historique LTR et RTL ;
5. inventaire de `dist/` sans `*.svg` Tabler, `*.woff` ni `*.woff2` ;
6. vérification des 5 112 icônes Outline, des deux faces Inter et de l'absence de registre SVG
   JavaScript ;
7. audit sans source JavaScript navigateur hors `dist/` ;
8. validation sans runtime, à 320 pixels CSS, des signaux SEO et du budget de performance ;
9. notes de migration pour toute divergence ;
10. version propre au fork, distincte du tag amont ;
11. tag annoté et immuable après acceptation.
