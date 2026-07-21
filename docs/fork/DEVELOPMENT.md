# Cycle de développement

## 1. Objet

Ce document définit le cycle normal d’une modification du framework Drake.css, les gates
obligatoires et la définition de « terminé ». Il complète la charte sans l’assouplir.

Le produit s’appelle officiellement « Drake.css framework » (forme courte : Drake.css). Les
espaces publics suivent la table de renommage de D-012 : API globale `Drake` (`window.Drake`),
types `Drake*`, classes `.drk-*`, attributs `drk-*` et `data-drk-*`, custom properties
`--drk-*`, artefacts `dist/css/drake*.css` et `dist/js/drake*.js`. Le projet amont n’est
désigné ici que comme « l’amont » (voir `FORK.md`).

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
- Une intégration amont utilise une branche `sync/*` nommée conformément à `UPSTREAM.md` et
  suit ce document.
- Une branche ne doit pas mélanger synchronisation amont, port Panda.css, changement d’asset
  et redesign.

Les commits **DEVRAIENT** être atomiques et suivre les préfixes conventionnels hérités de
l’amont : `build:`, `chore:`, `ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`,
`style:` ou `test:`.

## 4. Cycle d’une modification

### Étape 1 — Classer

Le contributeur identifie :

- le besoin vérifiable ;
- la catégorie ordinaire, sensible ou constitutionnelle ;
- les surfaces C0 à C3 concernées ;
- les sources canoniques et sorties générées touchées ;
- les licences ou versions épinglées éventuellement affectées ;
- l’impact HTML initial, mobile-first, SEO, accessibilité et Core Web Vitals.

Un changement constitutionnel s’arrête ici jusqu’à acceptation d’un amendement.

### Étape 2 — Établir la référence

Avant de modifier le code :

- relever `git status` ;
- exécuter ou documenter le test qui caractérise l’état actuel ;
- conserver un exemple minimal de la régression ou du comportement ;
- pour un changement de compatibilité, identifier l’équivalent dans la référence de parité
  D-012 : le dernier état vert de `fork/main` antérieur au renommage (voir `DECISIONS.md`).
  La parité C0 à C3 se mesure contre cette référence interne, pas contre l’amont ;
- capturer le HTML avant runtime et caractériser le comportement sans JavaScript lorsque le
  composant expose du contenu, une navigation ou une action essentielle.

### Étape 3 — Implémenter au bon niveau

- Modifier `panda.config.ts` et les modules de styles TypeScript sous `src/styles/`
  (section 6) ; le port Panda.css est achevé, `src/less/` et `src/scss/` n’existent plus.
- Modifier les générateurs pour les CSS Tabler ou Inter.
- Modifier exclusivement le TypeScript pour le runtime navigateur. Le port TypeScript est
  achevé : aucune source JavaScript navigateur **NE DOIT** être introduite, ni aucune
  coexistence JavaScript/TypeScript recréée.
- Rendre le contenu et la navigation dans le HTML serveur ou prérendu ; réserver le
  TypeScript à l’amélioration progressive.
- Écrire la mise en page de base pour 320 pixels CSS, puis les enrichissements avec
  `min-width`.
- Ne jamais corriger directement `dist/`, `src/styles/tabler.ts` ni une CSS générée par Panda.
- Ne jamais ajouter de mixin Less ou SCSS (section 6.4).

### Étape 4 — Tester au plus près

Le test le plus petit qui reproduit le comportement est ajouté ou mis à jour. Pour un
composant interactif, il couvre selon le cas :

- création par attribut `drk-*` et par API `Drake` ;
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

Les gates applicables sont exécutés dans l’ordre de la section 9. Une erreur est corrigée à
sa source ; un test ou un contrôle n’est pas neutralisé pour obtenir un résultat vert.

### Étape 6 — Relire le diff

Avant livraison :

- distinguer sources et sorties générées ;
- rechercher un changement hors périmètre ;
- vérifier les bannières de licence ;
- confirmer l’absence de fichiers `.svg` Tabler et `.woff`/`.woff2` autonomes distribués ;
- confirmer l’absence de source JavaScript navigateur et de registre SVG JavaScript ;
- confirmer l’absence de résurgence du préfixe hérité (`uk-`, `data-uk-`, `--uk-`, classes
  `.uk-*`) et des noms amont dans les sources, les tests et la distribution — contrôle
  automatisé par l’audit d’identité de `pnpm check-frontend` (G10), allowlist des zones
  autorisées dans `tests/fixtures/frontend-policy-allowlist.json`, bannières légales de
  `dist/` décomptées ;
- confirmer l’absence de nouveau mixin Less ou SCSS ;
- relire le HTML sans runtime, la cascade mobile-first et les signaux SEO applicables ;
- exécuter un second build et vérifier l’absence de diff inexpliqué.

### Étape 7 — Documenter

Le compte rendu indique le contrat concerné, les gates exécutés, les divergences connues et
les décisions éventuellement ajoutées.

## 5. Maintenance TypeScript

Le port TypeScript est achevé. Cette section ne décrit plus une migration mais les règles de
maintenance qui empêchent toute régression.

### 5.1 Règles permanentes

- TypeScript strict est l’unique langage source du runtime navigateur. Aucun fichier
  JavaScript source navigateur **NE DOIT** exister ni réapparaître, y compris dans les tests
  exécutés par un navigateur.
- esbuild produit le JavaScript compilé exclusivement sous `dist/` ; `tsc --noEmit` est
  l’autorité de type. Le build sépare transpilation et contrôle de types.
- Les entrées canoniques sont `src/js/drake.ts` et `src/js/drake-core.ts` ; les composants
  compilés sont livrés sous `dist/js/components/`.
- Le dépôt **DOIT** conserver les options compatibles avec la compilation isolée par esbuild,
  notamment `isolatedModules`. Les imports de types restent explicites et `allowJs`
  **NE DOIT PAS** couvrir le runtime navigateur.
- L’API globale exposée est `Drake` (`window.Drake`) ; les types internes et publics suivent
  l’espace `Drake*`.
- L’audit G10 vérifie mécaniquement l’absence de source JavaScript navigateur hors `dist/`.

### 5.2 Modèle de composants

Les types centraux du modèle de composants **DOIVENT** rester fidèles : props et
constructeurs de coercition, data initiale, computed et watchers, méthodes et leur `this`,
hooks de cycle de vie, événements, observers et updates, mixins, `extends`, composants
fonctionnels et instance attachée au nœud DOM.

Les helpers du type `defineComponent` et `defineMixin` **DOIVENT** continuer de fournir le
contexte `ThisType` et de composer les interfaces. Une maintenance qui dégrade cette
modélisation vers `Record<string, any>` n’est pas conforme.

### 5.3 Séparation des changements

Un refactor de types ou de structure :

- conserve les exports, chemins logiques et noms publics ;
- ne change ni algorithme, ni valeur par défaut, ni CSS ;
- ne remplace pas une API dynamique par une nouvelle abstraction runtime ;
- produit un bundle dont le comportement est caractérisé contre la référence de parité.

Les corrections découvertes pendant un refactor sont faites dans un commit séparé avec un
test d’échec.

## 6. Port Panda.css (D-013)

### 6.1 Sources canoniques

Le port est **achevé depuis le 2026-07-21** : `panda.config.ts` et les modules TypeScript
de `src/styles/` (tokens dans `tokens.ts`, fragments ordonnés `core/` et `theme/`,
module généré `tabler.ts`) sont l’unique source canonique des styles. `src/less/` et
`src/scss/` ont été supprimés ; la preuve de parité du port est consignée dans
`tests/fixtures/panda-parity-proof.json`.

- la CSS distribuée reste statique, générée par `build/panda.js` et déterministe ;
- `@pandacss/dev` est épinglée en version exacte (1.11.4) et suit la même discipline de
  lockfile que le reste de la chaîne ;
- l’ordre des fragments dans `core/index.ts` et `theme/index.ts` **EST** l’ordre de
  cascade : tout déplacement est un changement sensible.

### 6.2 Parité et évolutions

Le port initial a été réalisé cascade entière, avec un diff CSS normalisé vide sur les
quatre artefacts (`drake.css`, `drake-core.css` et leurs variantes RTL) face à la
référence pré-Panda. L’outil de comparaison est conservé : `build/fork/css-parity.js`
compare deux feuilles par séquence (contexte, sélecteur, propriété, valeur) avec tri
canonique commutatif. Tout refactor de la génération ou des fragments **DOIT** fournir un
diff de parité vide (G15) face à la dernière sortie verte, ou documenter les écarts
acceptés dans `DECISIONS.md`.

Un changement de styles ne modifie ni comportement runtime, ni HTML, ni valeur par
défaut ; toute évolution visuelle voulue est un commit séparé postérieur à la parité.

### 6.3 Déterminisme Panda

La génération Panda **DOIT** être déterministe : deux générations successives sur le même
arbre produisent des sorties bit-à-bit identiques. Ce contrôle est intégré à G9 et
s’exécute avant toute comparaison de parité ; une génération non reproductible bloque le
port du composant concerné.

### 6.4 Interdictions

- Aucune source Less ou SCSS (mixin compris) **NE DOIT** être réintroduite.
- La CSS générée par Panda n’est jamais éditée à la main.
- Aucun doublon de cascade hors `src/styles/` **NE DOIT** exister.

## 7. Développement des assets

### 7.1 Tabler

`@tabler/icons` reste une dépendance de développement épinglée à 3.45.0. Le générateur :

- lit l’intégralité des 5 112 icônes Outline, `brand-*` incluses ;
- exclut les variantes filled ;
- s’appuie sur le catalogue versionné `src/icons/drake-tabler.json` ;
- normalise et percent-encode les tracés en masques CSS `data:image/svg+xml` ;
- produit `dist/css/drake-tabler-icons.css` ;
- génère la classe de base `.drk-ti` et les classes `.drk-ti-{nom}` ;
- conserve la bannière MIT ;
- ne copie aucun fichier SVG dans la distribution ;
- produit, exclusivement en CSS, les alias de compatibilité des noms d’icônes hérités ;
- remplace les icônes internes sans registre, bundle ou injection SVG JavaScript.

Un changement de tri doit produire une sortie déterministe.
La migration des consommateurs et les divergences d’alias suivent `ICON_MIGRATION.md`.

### 7.2 Inter

Le générateur Inter :

- part des deux fichiers officiels 4.1 intacts, roman et italic ;
- vérifie leur empreinte ;
- les encode en WOFF2 `data:` URI dans deux règles `@font-face` de `dist/css/drake-inter.css` ;
- configure Inter comme police par défaut du framework via les tokens Panda
  (`src/styles/tokens.ts`) et la cascade de `src/styles/` ;
- conserve la notice SIL OFL 1.1 ;
- ne copie aucun fichier WOFF ou WOFF2 autonome dans la distribution.

Le sous-ensemblage, la modification des contours ou le renommage sont hors cycle ordinaire.

### 7.3 Commandes

Les points d’entrée attendus sont :

    pnpm build-icons-css
    pnpm build-inter-css
    pnpm build-assets
    pnpm check-assets

La CSS générée n’est jamais éditée à la main.

### 7.4 Validation locale complète

La commande canonique avant revue est :

    pnpm verify

Elle contrôle le formatage, exécute le lint JavaScript/TypeScript et le typecheck strict sans
émission, puis la génération des assets CSS, la génération Panda des feuilles LTR/RTL, les
contrôles d’assets et les gates frontend dans Chrome aux
largeurs 320 et 1 440 pixels. Le serveur utilisé par ce dernier contrôle écoute uniquement
sur une adresse locale et est arrêté après la mesure.

La reproductibilité G9 reste un contrôle séparé : repartir d’un arbre Git propre, exécuter
`pnpm verify` une seconde fois, puis exiger un `git diff --exit-code` vide. Ce contrôle
couvre la génération Panda au même titre que les autres sorties (section 6.3).

Les seuils, viewports et allowlists sont versionnés dans `tests/fixtures/`. Les mesures
Chrome propres à une machine (`*.metrics.json`) et les rapports détaillés de `reports/` sont
des preuves locales régénérées et ignorées par Git : leurs temps bruts ne sont pas bit-à-bit
reproductibles. G9 porte sur les sources et artefacts déterministes suivis, tandis que G13
réévalue les budgets à chaque exécution.

Pendant le développement, `pnpm watch` maintient en parallèle les bundles issus des sources
TypeScript et la CSS compilée depuis les sources de styles, Less ou Panda selon l’avancement
du port. Le watcher ne remplace jamais `pnpm verify` : il privilégie la vitesse, ne minifie
pas le runtime et ne lance pas les gates navigateur.

## 7 bis. Matrice C0-C3 outillée (G7)

`pnpm check-compat` exécute la matrice de compatibilité contre la référence de parité
D-012 :

- **C0/C1** — `build/fork/compat-snapshot.js` capture un snapshot structurel (balises,
  classes triées, attributs normalisés, ARIA, texte direct) de chaque page du catalogue
  `tests/` en LTR et RTL après boot, et le compare aux fixtures de
  `tests/fixtures/compat/`. Les valeurs volatiles (ids générés, pixels de styles en ligne,
  horodatages, compteurs de lecteurs vidéo) sont neutralisées ; les images distantes ne
  sont pas attendues hors ligne.
- **C2** — `build/fork/compat-scenarios.js` rejoue les scénarios d'interaction typés de
  `tests/js/compat/scenarios/` (clic, clavier, focus, ARIA, destruction sans résidu),
  chaque scénario partant d'une page rechargée.
- **C3** — `build/fork/compat-api.js` instancie et détruit programmatiquement chaque
  composant du registre public et vérifie l'expando `__drake__`.
- **Sans runtime** — `build/fork/compat-noruntime.js` recharge chaque page avec le
  JavaScript désactivé et compare les attentes du HTML initial (titres, liens avec
  `href`, texte, alternatives, contrôles natifs) à `tests/fixtures/compat/no-runtime.json` ;
  la lecture humaine par composant vit dans `docs/fork/NO_RUNTIME.md`.

`pnpm audit-heritage` (hors gate) inventorie la dette mobile-first/SEO héritée du
catalogue à 320 px (`tests/fixtures/heritage-audit.json`) ; une correction de dette est un
changement ordinaire qui met à jour l'inventaire.

Les fixtures de `tests/fixtures/compat/` ont été capturées depuis la référence de parité
(`fork/main` antérieur à D-012) via un worktree Git, la table de renommage étant appliquée
aux traces (`--write --map --root <worktree>`). Une recapture n'est légitime qu'après une
divergence **décidée** (nouvelle décision ou correction acceptée) et se fait alors depuis
le dernier état vert de `fork/main`, jamais pour faire taire un écart inexpliqué.

## 8. Matrice de tests de compatibilité

Les pages de `tests/` constituent le catalogue historique, renommé selon D-012. Elles doivent
être validées au minimum dans les modes suivants pour une release candidate :

| Axe           | Cas minimaux                                                                      |
| ------------- | --------------------------------------------------------------------------------- |
| Direction     | LTR et RTL                                                                        |
| Entrée        | souris, clavier et tactile lorsque pertinent                                      |
| Cycle DOM     | présent au chargement, ajouté, retiré, reconnecté                                 |
| API           | attribut `drk-*`, initialisation programmatique `Drake`, destruction              |
| Accessibilité | focus, nom, rôle, état, ordre clavier                                             |
| Responsive    | petit et grand viewport, resize                                                   |
| Assets        | icône courante, `brand-*` Outline, roman, italic                                  |
| Sans runtime  | HTML, contenu, liens, navigation et replis natifs                                 |
| Mobile-first  | reflow 320 px, zoom 400 %, cibles et enrichissements `min-width`                  |
| SEO           | metadata, canonical, robots, statuts, href, titres, images et données structurées |
| Performance   | LCP, CLS, proxy INP en laboratoire et données terrain disponibles                 |

La comparaison visuelle ne remplace pas les assertions de comportement et d’accessibilité.

## 9. Gates

| Gate                   | Commande ou preuve                                                                            | Bloquant pour                   |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| G0 — Périmètre         | `git status` et diff relu                                                                     | toute contribution              |
| G1 — Dépendances       | `pnpm install --frozen-lockfile` sous Node.js 24.18.0                                         | build et release                |
| G2 — Lint              | `pnpm exec eslint .`                                                                          | code et scripts                 |
| G3 — Types             | `pnpm typecheck` : `tsc --noEmit` + test de consommation des déclarations (`tests/types/`)    | runtime TypeScript              |
| G4 — Build             | `pnpm compile` : `drake.css`, `drake.min.css`, `drake.js`, `drake.min.js`, `dist/types/`      | code, styles et release         |
| G5 — RTL               | `pnpm compile-rtl` : `drake-rtl.css`, `drake-rtl.min.css`                                     | styles, composants et release   |
| G6 — Assets            | `pnpm build-assets` puis `pnpm check-assets` : `drake-tabler-icons.css`, `drake-inter.css`    | assets, packaging et release    |
| G7 — Compatibilité     | `pnpm check-compat` : snapshots C0/C1 du catalogue (LTR/RTL), scénarios C2, boucle C3         | runtime et release              |
| G8 — Légal             | versions, empreintes et notices contrôlées                                                    | assets et release               |
| G9 — Reproductibilité  | second build, génération Panda comprise, puis `git diff --exit-code`                          | release                         |
| G10 — Sources frontend | audit automatisé : TypeScript source uniquement, JavaScript navigateur seulement dans `dist/` | runtime et release              |
| G11 — HTML et SEO      | HTML HTTP/prérendu, sans runtime, statuts, liens, métadonnées et données structurées          | composants, exemples et release |
| G12 — Mobile-first     | reflow 320 px/400 %, cibles, LTR/RTL et parité mobile/bureau                                  | styles, composants et release   |
| G13 — Performance      | comparaison LCP/CLS/TBT laboratoire et revue LCP/INP/CLS terrain disponible                   | composants et release           |
| G14 — Icônes héritées  | aucun registre SVG JS ; toutes les icônes livrées résolues vers Tabler CSS `.drk-ti`          | assets, composants et release   |
| G15 — Parité Panda     | introduit par D-013 : diff CSS normalisé vert pour tout composant porté (section 6.2)         | styles, port Panda et release   |

Un changement documentaire seul exécute G0 et une revue de cohérence. Il n’a pas à
régénérer les artefacts s’il ne modifie aucune règle consommée par un générateur.

## 10. Définition de terminé

Une modification est terminée lorsque :

- son besoin et son périmètre sont explicites ;
- sa source canonique, et non sa sortie, a été modifiée ;
- elle possède les tests proportionnés au risque ;
- tous les gates applicables sont verts ;
- les sorties sont déterministes ;
- la parité C0 à C3 avec la référence D-012 est préservée ou la divergence est acceptée et
  documentée ;
- le HTML initial reste complet, indexable et utilisable sans runtime ;
- le reflow mobile-first, le SEO technique et les budgets de performance applicables sont
  démontrés ;
- aucun nouveau mixin Less ou SCSS n’est introduit et tout composant porté vers Panda
  présente un diff CSS normalisé vert (G15) ;
- les licences sont intactes ;
- aucun commentaire `TODO` non suivi ni contournement de type n’est ajouté ;
- le compte rendu permet à une autre personne de reproduire la validation.

## 11. Préparation d’une release

Les scripts de publication de l’amont sont volontairement absents : aucun automatisme local
ne doit pousser vers le dépôt du projet amont (voir `FORK.md`) ni créer une release GitHub.
Le manifeste npm porte le nom `drake.css`, le titre « Drake.css framework » et la version
propre au fork `0.1.0` ; la base amont est conservée en métadonnée de provenance. Tant qu’un
dépôt distant et une autorité de publication propres au fork n’ont pas été décidés, le
manifeste reste `private: true` et la préparation s’arrête à un paquet local audité.

Une release candidate exige en plus :

1. checkout propre depuis `fork/main` ;
2. installation gelée sous la chaîne officielle ;
3. suite complète des gates G1 à G14, plus G15 pour tout composant déjà porté vers
   Panda.css (D-013) ;
4. validation du catalogue historique LTR et RTL ;
5. inventaire de `dist/` sans `*.svg` Tabler, `*.woff` ni `*.woff2` ;
6. vérification des 5 112 icônes Outline, des deux faces Inter et de l’absence de registre
   SVG JavaScript ;
7. audit sans source JavaScript navigateur hors `dist/` ;
8. audit sans résurgence du préfixe hérité `uk-` ni des noms amont dans les sources, tests
   et `dist/` (audit d’identité G10 automatisé) ;
9. validation sans runtime, à 320 pixels CSS, des signaux SEO et du budget de performance ;
10. notes de migration pour toute divergence ;
11. version propre au fork, distincte de tout tag amont ;
12. tag annoté et immuable après acceptation.

Une release finale exige en outre l’achèvement du port Panda.css : plus aucun mixin Less ni
source Less/SCSS résiduelle, `panda.config.ts` et les modules de styles TypeScript étant
alors l’unique source canonique des styles (section 6).
