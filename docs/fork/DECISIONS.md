# Registre des décisions

## Usage

Ce registre contient les décisions structurantes du fork. Une décision **acceptée** est
normative. Elle reste applicable jusqu’à son remplacement par une nouvelle décision issue de
la procédure d’amendement de `CHARTER.md`.

Statuts possibles :

- **Proposée** : discussion ouverte, non applicable ;
- **Acceptée** : applicable ;
- **Remplacée** : conservée pour l’historique, remplacée par une autre décision ;
- **Rejetée** : examinée mais non retenue.

Une décision n’est pas modifiée pour effacer son historique. Un changement de sens ajoute une
nouvelle entrée et marque l’ancienne comme remplacée.

## D-001 — Base UIkit immuable

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Le fork part de UIkit `v3.25.20` au commit
`45cc430052ba967de8e9972507dee4d37701552d`.

Le tag amont étant léger et non signé, le fork enregistre le SHA et crée un tag local annoté
`fork-base/uikit-v3.25.20`. `upstream` reste le dépôt officiel en lecture seule.

### Conséquences

- La provenance est vérifiable.
- Une future mise à jour suit `UPSTREAM.md`.
- Le tag amont ne peut pas nommer une release modifiée du fork.

## D-002 — TypeScript pour le runtime navigateur

- Date : 2026-07-21
- Statut : **Remplacée**
- Remplacée par : D-011, le 2026-07-21

### Décision

TypeScript strict est le langage source cible du runtime. La migration est progressive avec
coexistence temporaire des fichiers JavaScript historiques.

esbuild produit le JavaScript de distribution ; `tsc --noEmit` contrôle les types. Les
scripts de build Node.js peuvent rester en JavaScript.

### Raisons

- Préserver le comportement JavaScript et le contrat UIkit.
- Migrer par petites unités vérifiables.
- Ajouter des types publics sans imposer un nouveau runtime.

### Conséquences

- Le JavaScript dans `dist/js/` est attendu.
- Une conversion ne doit pas contenir de redesign.
- Les abstractions dynamiques UIkit doivent recevoir une modélisation typée centrale.

## D-003 — Elm réservé à un adaptateur futur

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Elm n’entre ni dans le cœur, ni dans la chaîne obligatoire, ni dans le contrat du runtime.

Après stabilisation, un adaptateur Elm peut être proposé comme paquet séparé consommant les
API publiques et le CSS du fork.

### Raisons

Une réécriture Elm changerait le modèle de possession du DOM et exigerait une glue JavaScript
importante pour les observers, mesures, plugins et API impératives. Elle ne préserverait pas
le fork comme progressive enhancement compatible UIkit.

### Conséquences

- Aucun port Elm dans le cœur.
- Aucun composant ne dépend d’une application Elm pour fonctionner.
- Le jalon Elm reste non bloquant et postérieur à la première release stable.

## D-004 — Compatibilité avant modernisation

- Date : 2026-07-21
- Statut : **Remplacée**
- Remplacée par : D-012, le 2026-07-21

### Décision

Les attributs `uk-*`/`data-uk-*`, classes, événements, cycle DOM, accessibilité, RTL et API
publique de UIkit 3.25.20 sont protégés.

Une sortie ESM ou une API plus typée peut être ajoutée, mais les bundles et usages historiques
ne sont supprimés qu’après une décision de rupture et un plan de migration.

### Conséquences

- Les tests couvrent les niveaux C0 à C3 applicables.
- Toute divergence intentionnelle est documentée.
- La conversion TypeScript ne sert pas de prétexte à une nouvelle architecture runtime.

## D-005 — Tabler Icons Outline 3.45.0 en CSS

- Date : 2026-07-21
- Statut : **Acceptée**
- Amendée par : D-012 (espace de noms .drk-ti), le 2026-07-21

### Décision

Le catalogue officiel contient exactement les 5 112 icônes Outline de
`@tabler/icons@3.45.0`, y compris les `brand-*` qui appartiennent à ce catalogue. Les
variantes filled sont exclues.

Le générateur produit `dist/css/uikit-tabler-icons.css` avec `mask` et
`-webkit-mask`. Les tracés SVG sont percent-encodés dans des `data:image/svg+xml`.
La classe de base est `.uk-ti` et chaque entrée utilise `.uk-ti-{nom}`.

Aucun fichier ou asset Tabler `.svg` autonome n’est distribué.

### Raisons

- Catalogue cohérent et épinglé.
- Coloration par `currentColor` et usage CSS.
- Distribution monofichier sans requêtes d’icônes.

### Conséquences

- La CSS contient des données SVG ; « sans SVG distribué » signifie sans fichier autonome.
- La CSP cliente doit permettre `img-src data:`.
- Le nombre de classes, la version, les empreintes et l’absence de fichiers SVG sont des
  gates automatiques.
- La licence MIT de Tabler est conservée dans les sorties ou notices.

## D-006 — Inter 4.1 variable roman et italic en CSS

- Date : 2026-07-21
- Statut : **Acceptée**
- Amendée par : D-022 (variante en fichiers WOFF2 subsettés ; la clause « aucun subset ne
  peut conserver le nom Inter » reposait sur l'hypothèse d'un Reserved Font Name — l'en-tête
  OFL d'Inter n'en déclare aucun), le 2026-07-21

### Décision

Inter 4.1 officielle devient la police du framework. Les faces variables roman et italic
intactes sont encodées en WOFF2 `data:` URI dans `dist/css/uikit-inter.css`.

Aucun fichier `.woff` ou `.woff2` autonome n’est distribué.

### Raisons

- Une famille variable cohérente pour le roman et l’italique.
- Une CSS autonome, sans chargement réseau.
- Pas de duplication de fichiers de fontes dans la distribution.

### Conséquences

- La CSS contient des octets WOFF2 ; l’interdiction vise les fichiers autonomes.
- La CSP cliente doit permettre `font-src data:`.
- Les deux faces et leurs empreintes sont contrôlées.
- La SIL OFL 1.1 et le nom réservé « Inter » sont respectés.
- Aucun subset ou dérivé ne peut conserver le nom Inter.

## D-007 — Sources de styles et artefacts générés

- Date : 2026-07-21
- Statut : **Remplacée**
- Remplacée par : D-011, le 2026-07-21

### Décision

`src/less/` est la source canonique des styles. `src/scss/`, `dist/` et
`tests/js/test.js` sont générés.

Les CSS Tabler et Inter sont elles aussi générées depuis des entrées épinglées. Une correction
manuelle d’une sortie est interdite.

### Conséquences

- Toute correction est faite dans la source ou le générateur.
- Un second build ne doit produire aucun diff.
- Les conflits amont dans les sorties sont résolus en régénérant.

## D-008 — Chaîne reproductible épinglée

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

La chaîne officielle utilise Node.js 24.18.0, pnpm 11.4.0 et le lockfile gelé. Une release
exécute lint, typecheck, build normal, build RTL, contrôles d’assets, tests de compatibilité et
contrôle de reproductibilité.

### Conséquences

- Une validation sous une autre version n’est qu’indicative.
- esbuild seul ne constitue pas un typecheck.
- Un artefact non déterministe bloque la release.

## D-009 — Licences et notices préservées

- Date : 2026-07-21
- Statut : **Acceptée**
- Amendée par : D-022 (le sous-ensemble d'Inter est licite sans renommage, OFL sans
  Reserved Font Name ; l'exigence d'amendement est satisfaite par D-022 même), le
  2026-07-21

### Décision

Le fork conserve :

- UIkit sous MIT avec ses mentions amont ;
- Tabler Icons 3.45.0 sous MIT ;
- Inter 4.1 sous SIL Open Font License 1.1.

Les bannières essentielles survivent à la minification. La provenance et la version de chaque
asset sont vérifiables depuis le build et le lockfile.

### Conséquences

- Une sortie sans licence applicable est non publiable.
- Une mise à jour tierce nécessite revue de licence et décision de version.
- Modifier Inter ou en produire un sous-ensemble exige un nouveau nom et un amendement.

## D-010 — Amendements explicites

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Les versions sanctuarisées, le langage du cœur, le contrat de compatibilité, les formats
d’assets, les licences et les gates de release ne changent pas implicitement.

Toute modification passe par :

1. une proposition documentaire ;
2. une analyse des alternatives et impacts ;
3. l’acceptation explicite du mainteneur ;
4. une nouvelle décision ;
5. l’implémentation seulement après ou dans un commit ultérieur clairement séparé.

### Conséquences

- Un changement de code contradictoire avec la charte reste non conforme même s’il compile.
- Ce registre conserve l’historique des décisions remplacées.

## D-011 — Frontend TypeScript-only, HTML-first, mobile-first et Tabler-only

- Date : 2026-07-21
- Statut : **Acceptée**
- Remplace : D-002 et D-007
- Complète : D-004 et D-005
- Amendée par : D-012 (identité et préfixes) et D-013 (source des styles), le 2026-07-21

### Contexte

La coexistence transitoire de sources JavaScript et TypeScript, le catalogue SVG historique
et une compatibilité centrée sur le rendu client ne garantissent ni une architecture sans
JavaScript source frontend, ni l'indexabilité du HTML initial, ni une conception réellement
mobile-first. UIkit amont doit donc être adapté à ces contraintes, et pas seulement recompilé.

### Options examinées

1. Conserver la migration incrémentale avec `allowJs` et repousser les garanties à la release.
2. Réécrire le cœur en Elm avec une couche d'interopération JavaScript.
3. Imposer TypeScript comme unique source navigateur, HTML rendu ou prérendu comme autorité
   de contenu, CSS mobile-first et Tabler CSS comme unique catalogue livré.

La troisième option est retenue. La première autoriserait durablement deux sources frontend ;
la seconde changerait le modèle DOM et nécessiterait une interopération contraire au but.

### Décision

- Toute source exécutée par un navigateur est en TypeScript strict. Le JavaScript compilé
  indispensable est distribué exclusivement sous `dist/`. Les scripts Node.js de build
  peuvent rester en JavaScript lorsqu'ils ne sont pas du frontend.
- `src/less/` reste la source canonique des styles ; `src/scss/` et `dist/` sont générés et
  jamais corrigés manuellement. Le bundle historique `tests/js/test.js` est supprimé au
  profit de sources de test TypeScript et de sorties navigateur sous `dist/`.
- L'intégralité du contenu, de la navigation, des liens, titres, métadonnées, canonical,
  directives robots et données structurées est présente dans la réponse HTTP ou le HTML
  prérendu. Le TypeScript est une amélioration progressive non bloquante.
- La CSS part d'une base fonctionnelle à 320 pixels CSS et enrichit la mise en page par
  media queries `min-width`. Mobile et bureau conservent un contenu et une sémantique
  équivalents.
- Le profil SEO technique couvre les statuts HTTP, liens `<a href>`, données structurées,
  images, titres et Core Web Vitals, conformément à `MOBILE_FIRST_SEO.md`.
- Tabler Icons Outline 3.45.0 en CSS remplace toutes les icônes UIkit livrées. Aucun registre,
  bundle ou catalogue SVG JavaScript n'est distribué.

### Conséquences

- La coexistence historique permise par D-002 cesse d'être conforme ; toutes les sources
  JavaScript navigateur restantes sont une dette bloquant la release.
- Les composants qui fabriquent du contenu indispensable côté client doivent être refondus
  autour d'un HTML initial complet et d'un repli natif.
- Les anciens noms d'icônes peuvent survivre uniquement comme alias CSS documentés vers
  Tabler, sans second catalogue.
- Les gates vérifient l'absence de source JavaScript navigateur et de registre SVG JS, le
  fonctionnement sans runtime, le reflow à 320 pixels CSS, la parité mobile/bureau, le SEO
  technique et les budgets de performance.
- Les divergences avec UIkit amont sont assumées et doivent être réappliquées lors de chaque
  synchronisation.

## D-012 — Identité Drake.css framework et renommage des espaces publics

- Date : 2026-07-21
- Statut : **Acceptée**
- Remplace : D-004
- Amende : D-005 et D-011

### Contexte

Le fork s'est doté de piliers propres qui le distinguent durablement de l'amont. Conserver le
nom amont, le préfixe `uk-` et l'API globale `UIkit` entretient une confusion de provenance,
suggère une interchangeabilité qui n'est plus garantie et attache le contrat de compatibilité
de D-004 à une API publique littérale que le fork ne souhaite plus exposer. Le mainteneur a
arrêté le 2026-07-21 l'identité « Drake.css framework », forme courte autorisée
« Drake.css ».

### Options examinées

1. Conserver le nom et les préfixes amont, statu quo de D-004.
2. Renommer le paquet npm et les artefacts seulement, en conservant `uk-*` et `UIkit`.
3. Renommer intégralement les espaces publics selon une table normative unique et redéfinir la
   compatibilité comme une parité comportementale avec la référence interne pré-renommage.

La troisième option est retenue. La première fige la confusion d'identité ; la deuxième
produit un hybride dont les classes contredisent le nom et dont la surface publique reste
celle de l'amont.

### Décision

Le fork s'appelle officiellement « Drake.css framework » ; la forme courte « Drake.css » est
autorisée. La table de renommage suivante est normative :

| Surface                 | Avant          | Après           |
| ----------------------- | -------------- | --------------- |
| API globale JS et UMD   | `window.UIkit` | `window.Drake`  |
| Types internes          | `UIkit*`       | `Drake*`        |
| Classes CSS             | `.uk-*`        | `.drk-*`        |
| Attributs de composants | `uk-*`         | `drk-*`         |
| Attributs data          | `data-uk-*`    | `data-drk-*`    |
| Custom properties       | `--uk-*`       | `--drk-*`       |
| Icônes, classe de base  | `.uk-ti`       | `.drk-ti`       |
| Icônes, entrées         | `.uk-ti-{nom}` | `.drk-ti-{nom}` |

Les noms de fichiers et de paquet suivent la même identité :

- catalogue d'icônes `src/icons/drake-tabler.json`, sortie `dist/css/drake-tabler-icons.css` ;
  le catalogue reste Tabler Icons 3.45.0 Outline, 5 112 icônes, masques CSS
  `data:image/svg+xml`, zéro fichier SVG distribué ;
- typographie Inter 4.1 variable roman et italic, encodée WOFF2 en `data:` URI dans
  `dist/css/drake-inter.css`, zéro fichier `.woff` ou `.woff2` autonome, inchangée sur le
  fond ;
- artefacts `dist/css/drake.css`, `drake.min.css`, `drake-rtl.css`, `drake-rtl.min.css`,
  `drake-tabler-icons.css` et `drake-inter.css` ; `dist/js/drake.js`, `drake.min.js` et les
  composants sous `dist/js/components/` ;
- sources `src/js/drake.ts` et `src/js/drake-core.ts` ;
- paquet npm `name` « drake.css », `title` « Drake.css framework », version propre au fork
  `0.1.0`, base amont `3.25.20` conservée en métadonnée de provenance, `private: true` tant
  que le remote `origin` n'est pas décidé.

Tout autre nom public hérité de l'amont, dont les variantes `-core`, suit le même schéma de
correspondance.

Le contrat de compatibilité est redéfini : la parité comportementale C0 à C3 s'évalue contre
la référence interne pré-renommage, définie comme le dernier état vert de `fork/main` avant
l'application de D-012, et non plus contre l'API publique amont littérale.

Le nom amont UIkit, ainsi que getuikit.com et YOOtheme, n'apparaît plus que dans `FORK.md`,
`docs/fork/UPSTREAM.md`, `docs/fork/DECISIONS.md`, `docs/fork/CHANGELOG-uikit-amont.md`,
`LICENSE.md`, `THIRD_PARTY_NOTICES.md`, `licenses/`, les bannières légales générées, la
métadonnée de provenance de `package.json` et le remote git `upstream`. Partout ailleurs, les
textes écrivent « l'amont » ou « le projet amont (voir FORK.md) » sans le nommer. Les
obligations légales MIT, dont le copyright YOOtheme, ne sont jamais supprimées.

La chaîne officielle est inchangée : Node.js 24.18.0 exact, pnpm 11.4.0, `pnpm verify` et les
gates G0 à G14.

### Conséquences

- D-004 est remplacée ; D-005 est amendée sur l'espace de noms `.drk-ti` ; D-011 est amendée
  sur l'identité, les préfixes et les noms d'artefacts.
- Les validations C0 à C3 s'exécutent contre la référence pré-renommage ; toute divergence
  comportementale intentionnelle reste documentée.
- Un gate vérifie l'absence du nom et des préfixes amont hors des emplacements autorisés.
- Les alias d'icônes admis par D-011 pointent vers `.drk-ti-{nom}`, sans second catalogue.
- L'alias d'icône historique qui portait le nom de l'amont est renommé `drake` dans
  `src/icons/drake-tabler.json` ; les autres noms d'alias hérités sont conservés tels
  quels et le compte de 162 alias publics reste inchangé.
- Le renommage ne touche ni les licences ni les notices ; les mentions MIT amont sont
  conservées à l'identique.
- La version `0.1.0` ouvre un versionnage propre au fork ; `3.25.20` ne subsiste qu'en
  métadonnée de provenance.
- Chaque synchronisation amont réapplique la table de renommage avant toute validation.

## D-013 — Styles portés vers Panda.css

- Date : 2026-07-21
- Statut : **Acceptée**
- Amende : D-007 et D-011, sur la source canonique des styles

### Contexte

Les styles sont maintenus en Less, avec une duplication SCSS générée. Ce DSL non typé est le
dernier espace auteur du fork hors TypeScript : les mixins Less concentrent une logique de
style que ni le compilateur ni les gates ne peuvent typer, et contredisent l'esprit du pilier
TypeScript-only appliqué au reste des sources.

### Options examinées

1. Rester en Less : statu quo sans coût de migration, mais la logique de style demeure dans
   un langage non typé, invérifiable par le typage, adossé à un écosystème en déclin.
2. Passer à Sass : moderniserait la syntaxe sans changer le fond ; la logique de style
   resterait dans un DSL non typé parallèle au TypeScript.
3. Adopter vanilla-extract : zéro runtime et auteur TypeScript, mais pensé pour des feuilles
   par composant applicatif ; tokens sémantiques, recettes et génération d'une cascade
   complète de framework y sont moins riches.
4. Adopter Tailwind CSS : imposerait une surface utilitaire au lieu des classes de composants
   `.drk-*`, changerait l'API CSS publique et contredirait le contrat de parité de D-012.
5. Adopter Panda.css : configuration TypeScript typée, tokens et tokens sémantiques,
   recettes, fonctions de style typées, codegen statique et zéro runtime.

La cinquième option est retenue : elle aligne la source des styles sur le pilier
TypeScript-only tout en conservant une CSS distribuée statique et une surface publique
inchangée.

### Décision

Les styles quittent Less et SCSS pour Panda.css (`github.com/chakra-ui/panda`) :

- la génération est pilotée par `panda.config.ts` et des modules TypeScript de styles :
  tokens, tokens sémantiques, recettes, fonctions de style typées remplaçant les mixins Less
  et `globalCss` pour la cascade héritée ;
- la CSS distribuée reste statique, générée et déterministe : deux générations successives
  produisent des sorties identiques ;
- la dépendance `@pandacss/dev` est épinglée en version exacte lors de son introduction.

Transition : `src/less/` reste la source canonique et `src/scss/` reste généré tant que le
port Panda n'est pas achevé composant par composant avec preuve de parité par diff CSS
normalisé. Les mixins Less restants sont une dette bloquant la release finale.

### Conséquences

- D-007 et D-011 sont amendées sur la source canonique des styles ; leurs autres règles
  demeurent applicables.
- Chaque composant porté fournit un diff CSS normalisé vide, ou aux divergences documentées,
  avant que sa source d'autorité ne bascule vers Panda.
- Un gate de déterminisme compare deux générations complètes ; toute différence bloque.
- Pendant la transition, une correction de style est faite dans la source canonique du
  composant concerné, jamais dans une sortie générée.
- La release finale est bloquée tant qu'il subsiste un mixin Less ou une source Less ou SCSS
  canonique.
- L'introduction de `@pandacss/dev` suit D-008 : version exacte, lockfile gelé et
  reproductibilité vérifiée.

## D-014 — Elm reconduit hors du cœur après réexamen

- Date : 2026-07-21
- Statut : **Acceptée**
- Complète : D-003

### Contexte

À la demande du mainteneur, la place d'Elm a été réexaminée le 2026-07-21, à la lumière de la
nouvelle identité (D-012) et du port des styles vers Panda.css (D-013). La question posée
était de savoir si ces évolutions ouvrent une pertinence nouvelle pour Elm dans le cœur.

### Options examinées

1. Porter le cœur en Elm.
2. Introduire un adaptateur Elm dans le dépôt principal.
3. Reconduire D-003 : Elm hors du cœur, adaptateur possible en paquet séparé après
   stabilisation.

La troisième option est retenue.

### Décision

Les raisons de D-003 sont reconduites : la possession du DOM par Elm reste incompatible avec
le progressive enhancement HTML-first du fork. Ni D-012 ni D-013 ne changent ce constat, et
aucune pertinence d'Elm dans le cœur n'a été identifiée.

Un adaptateur Elm reste possible en paquet séparé après stabilisation du cœur, aux conditions
de la charte.

### Conséquences

- D-003 demeure applicable sans modification ; le réexamen est tracé sans changer la règle.
- Aucun composant, gate ou script de build ne dépend d'Elm.
- Un nouveau réexamen n'intervient que sur demande explicite du mainteneur.

## D-015 — Minification des feuilles par Lightning CSS

- Date : 2026-07-21
- Statut : **Acceptée**
- Complète : D-013

### Contexte

La minification CSS reposait sur clean-css, hérité de l'amont. Le projet est en
quasi-hibernation et le build utilisait une option obsolète depuis clean-css v4
(`keepSpecialComments`), silencieusement ignorée. Depuis D-013, la génération des feuilles
est pilotée par l'écosystème Panda, qui embarque déjà Lightning CSS
(`@pandacss/plugin-lightningcss`) dans l'arbre de dépendances épinglé.

### Options examinées

1. Conserver clean-css en corrigeant l'option obsolète.
2. Passer à cssnano (PostCSS).
3. Passer à Lightning CSS pour la seule minification.

La première option garde un outil non maintenu ; la deuxième ajoute une chaîne PostCSS
supplémentaire sans gain décisif. La troisième est retenue : outil activement maintenu,
plus rapide, sortie plus compacte, cohérent avec l'écosystème Panda déjà adopté.

### Décision

- La minification des huit feuilles `dist/css/*.min.css` est produite par `lightningcss`,
  épinglé en version exacte, appelé par `minify()` dans `build/util.js`.
- Le périmètre est STRICTEMENT la minification : aucune transpilation vers des cibles
  navigateurs et aucun ajout ou retrait de préfixe vendeur ne sont activés, afin de ne pas
  modifier la sémantique de la cascade protégée par la parité D-013/G15.
- Lightning CSS supprimant tous les commentaires, les bannières légales de tête
  (`/*! … */` Drake et Tabler) sont extraites de la feuille source et re-préfixées à la
  sortie minifiée ; le gate `check-assets` continue d'exiger leur présence dans chaque
  feuille distribuée.
- clean-css est retiré des dépendances.

### Conséquences

- La minification peut restructurer les règles (fusions sémantiquement équivalentes) : les
  fichiers `.min.css` ne sont plus comparables règle à règle aux feuilles non minifiées ;
  la confiance repose sur les gates (bannières, comptes d'assets, G9 déterminisme,
  navigateur G10-G13) et des contrôles ciblés (`@property`, `@-moz-document`, séquences
  d'échappement) après tout changement de version.
- `lightningcss` embarque un binaire natif par plateforme ; sa version est épinglée exacte
  et l'installation reste hors ligne depuis le store pnpm.
- Une mise à jour de `lightningcss` est un changement sensible : preuves de gates et
  contrôles ciblés exigés.

## D-016 — Theming par propriétés personnalisées

- Date : 2026-07-21
- Statut : **Acceptée** (directive du mainteneur du 2026-07-21 : « on fait TOUT ce qui
  reste à faire », en réponse à la proposition explicitement soumise à arbitrage)
- Complète : D-013

### Contexte

Depuis B1 (D-013), les fragments de `src/styles/` consomment les tokens de `tokens.ts` à la
génération : changer un token et régénérer suffit à rethémer la distribution, et la
substitution est prouvée neutre par le diff de parité G15. Ce theming est cependant
uniquement _build-time_ : une intégration ne peut pas rethémer sans reconstruire, et il
n'existe pas de chemin standard vers un mode sombre. La mécanique héritée `.drk-light` /
`.drk-dark` (inversion locale) reste distincte d'un theming global.

### Options examinées

1. Statu quo : tokens build-time uniquement ; tout theming passe par une régénération.
2. Exposer le sous-ensemble sémantique (les ~15 tokens de `tokens.ts` : couleurs, pile
   typographique) en propriétés personnalisées `var(--drk-color-*, …)` émises dans
   `:root`, avec les valeurs actuelles en repli ; les fragments référencent la variable.
3. Généraliser les propriétés personnalisées à toutes les valeurs (espacements, tailles,
   rayons…), à la manière d'un design system complet.

L'option 1 limite l'adoption ; l'option 3 grossit la feuille et multiplie les surfaces de
compatibilité sans besoin établi. L'option 2 est proposée : bornée, alignée sur la
sémantique déjà nommée par `tokens.ts`, et convergente avec `--drk-breakpoint-*` que le
runtime lit déjà.

### Décision

- Émettre dans `:root` les propriétés `--drk-color-{nom}` et `--drk-font-body` depuis les
  tokens, et faire consommer `var(--drk-…, <valeur actuelle>)` par les fragments.
- Documenter le contrat de surcharge (une intégration redéfinit les variables, sans CDN ni
  runtime) et le chemin mode sombre : un bloc `@media (prefers-color-scheme: dark)` opt-in
  redéfinissant le sous-ensemble, cohérent avec `.drk-light`/`.drk-dark`.
- Périmètre CSP inchangé (aucune ressource nouvelle) ; surcoût estimé ≤ 2 Ko avant
  compression.

### Conséquences

- La CSS distribuée change textuellement : la preuve de parité G15 ne s'applique pas telle
  quelle ; la migration exige une comparaison de valeurs calculées (les `var()` avec repli
  résolvent aux valeurs actuelles) et les gates complets G0-G15, dont G12/G13 navigateur.
- Le contrat public s'étend : les noms `--drk-*` exposés deviennent des surfaces protégées
  (tout retrait ou renommage exigera une décision et une migration).
- Implémentée le 2026-07-21 : `src/styles/root-tokens.ts` ouvre la cascade avec les
  propriétés publiées, `tokens.ts` sépare valeurs brutes (paletteValues, fontFamilyValues)
  et références consommées (`var(--drk-…, <valeur héritée>)`) ; équivalence calculée
  prouvée par les gates navigateur (G10-G13) et la matrice G7.

## D-017 — Cap de stabilisation 0.1.0 (release candidate)

- Date : 2026-07-21
- Statut : **Acceptée** (arbitrage explicite du mainteneur du 2026-07-21, quatre réponses
  au questionnaire de stabilisation)
- Complète : D-012 (identité et version initiale), D-016 (surfaces `--drk-*`)

### Contexte

Les phases 0, 1, 2 et 8 sont terminées et la matrice C0-C3 (G7) est verte. La phase 9
(stabilisation et release candidate) exige des arbitrages qui n'appartiennent qu'au
mainteneur : le remote `origin`, le sort de `private: true`, le schéma de version, et la
politique de résorption de la dette héritée inventoriée
(`tests/fixtures/heritage-audit.json` : 22 débordements à 320 px, 337 cibles < 24 px hors
liens en ligne, 8 images sans alt, 50 sans dimensions réservées, 19 sauts de titres). La
phase 6 laisse en outre ouverte la question d'une sortie ESM.

### Options

1. Remote : aucun (local), GitHub privé, GitHub public.
2. Version : SemVer avec tags release candidate, SemVer direct, CalVer.
3. Dette : résorption côté catalogue avec registre d'exceptions, résorption totale y
   compris CSS des composants (divergence du contrat C0-C3), catégories objectives seules.
4. npm : conserver `private: true`, préparer une publication.
5. ESM : différer, livrer en 0.1.0.

### Décision

- **Remote** : `origin` sera un dépôt GitHub **privé** `drake-css`. La création du dépôt
  et tout push restent soumis à un feu vert explicite du mainteneur, action par action ;
  jusque-là le dépôt reste purement local. Cette décision clôt le critère « décider le
  remote `origin` » de la phase 9.
- **Version** : SemVer strict propre au fork. La stabilisation produit des tags annotés
  signés `v0.1.0-rc.N` ; l'acceptation finale produit `v0.1.0`. Les tags du fork restent
  distincts des tags amont (`fork-base/uikit-v3.25.20`).
- **Dette héritée** : résorption intégrale **côté catalogue** (markup des pages de
  `tests/` et chrome injecté par le harnais de test) : alternatives, dimensions réservées,
  hiérarchie de titres, débordements à 320 px et cibles corrigibles au markup. Le CSS des
  composants reste conforme à la référence pré-renommage : le contrat C0-C3 n'est pas
  amendé. Chaque résidu < 24 px inhérent à un composant hérité, ou à ce qu'une page
  démontre (les variantes small restent démontrées), est consigné avec justification dans
  le registre d'exceptions `docs/fork/HERITAGE_EXCEPTIONS.md`, à trancher composant par
  composant par des décisions ultérieures. Les fixtures C0/C1 et sans-runtime divergent
  par la présente décision : leur recapture est autorisée uniquement pour les pages
  corrigées, divergence documentée dans le changement livré.
- **npm** : `private: true` est conservé tant qu'une publication npm n'est pas
  explicitement décidée (garde-fou anti-publication accidentelle). Le critère « lever
  `private: true` » de la phase 9 est traité par la présente décision : il ne sera levé
  que par une décision de publication dédiée.
- **ESM** : aucune sortie ESM en 0.1.0. Le critère de la phase 6 (« l'ESM, s'il est
  livré, ne duplique pas inutilement le runtime ») est clos : il n'est pas livré.
  Réexamen possible après stabilisation, sans bloquer une release.

### Conséquences

- La phase 9 peut se clore sans remote effectif ni publication npm ; le tag release
  candidate est local, annoté et signé.
- Les corrections du catalogue sont des changements sensibles sur les surfaces C0/C1 :
  recapture décidée des fixtures concernées, re-inventaire `pnpm audit-heritage`, et
  scénarios C2/boucle C3 exigés verts sans recapture.
- Les déclarations `.d.ts` de la phase 6 restent exigées avant la clôture de cette phase ;
  elles ne relèvent pas de la présente décision (aucun arbitrage nécessaire).
- Aucun impact licences ni assets ; le catalogue n'est pas distribué dans `dist/`.

## D-018 — Publication npm publique de drake.css

- Date : 2026-07-21
- Statut : **Acceptée** (directive du mainteneur du 2026-07-21 : « tout ça dans le bon
  ordre, pertinent », en réponse à l'arbitrage explicitement posé sur la publication)
- Complète : D-017

### Contexte

D-017 conservait `private: true` comme garde-fou en l'absence de décision de publication.
L'acceptation finale `v0.1.0` est donnée, le nom `drake.css` est libre sur le registre
public npm (vérifié le 2026-07-21), et la packlist est auditée en continu (G8 : fichiers
autorisés, notices MIT et SIL OFL, empreintes).

### Options

1. Statu quo : paquet privé, consommation par le dépôt git uniquement.
2. Registre npm privé (GitHub Packages) adossé au dépôt.
3. Registre npm public sous le compte du mainteneur.

### Décision

- Publier `drake.css` sur le registre public npm sous le compte du mainteneur ;
  `private: true` est levé dans le même changement.
- Toute version publiée correspond à un tag annoté signé du fork ; `prepack` (chaîne
  complète de build et d'audits) reste le garde-fou d'intégrité à l'empaquetage.
- Le `npm publish` effectif est exécuté par le mainteneur authentifié ; l'agent prépare
  tout (dry-run, packlist, version) mais ne manipule jamais de credentials.

### Conséquences

- Une version publiée est un engagement public : la politique de dépublication npm est
  restrictive, et une version ne se republie jamais (immutabilité SemVer).
- Les notices légales voyagent dans le paquet (`licenses/`, `THIRD_PARTY_NOTICES.md`,
  bannières `/*!` préservées par la minification).
- La provenance amont reste documentée dans les métadonnées du paquet.

## D-019 — Visibilité publique du dépôt

- Date : 2026-07-21
- Statut : **Acceptée** (arbitrage explicite du mainteneur du 2026-07-21, « Public après
  CI verte »)
- Complète : D-017 (remote), D-018 (publication npm)

### Contexte

D-017 a établi le remote `origin` comme dépôt GitHub privé. D-018 publie ensuite le
paquet `drake.css` sur le registre npm public, dont la packlist embarque les sources
TypeScript : la confidentialité du dépôt ne protège plus rien de substantiel. Le dépôt
est légalement prêt pour l'exposition : licence MIT amont conservée à l'identique,
notices Tabler et Inter, provenance documentée, historique intégralement signé, identités
de commit en adresses noreply.

### Options

1. Rester privé (statu quo D-017), cohérent seulement si la publication npm est reportée.
2. Rendre le dépôt public immédiatement.
3. Rendre le dépôt public après une exécution CI verte de bout en bout sur `fork/main`.

### Décision

Le dépôt `Test-bot-cell/Drake-css-framework` devient **public**, après la preuve CI verte
sur `fork/main` (correctif de la course de capture du harnais fusionné). Le README cesse
de qualifier le fork de « privé ». Tout push reste soumis au feu vert du mainteneur,
action par action (D-017 inchangée sur ce point).

### Conséquences

- L'historique complet est exposé ; un retour au privé resterait possible mais ne
  rappellerait pas les clones existants — la décision s'assume comme quasi définitive.
- Les runs GitHub Actions deviennent publics, y compris le run rouge historique du
  commit tagué `v0.1.0` (course de harnais documentée, produit prouvé par ailleurs) :
  la transparence est préférée à la réécriture.
- Issues et pull requests publiques : leur triage suit AGENTS.md et le registre des
  décisions ; aucune gouvernance nouvelle n'est créée par la visibilité.

## D-020 — Distribution par GitHub, registre npm optionnel

- Date : 2026-07-21
- Statut : **Acceptée** (directive du mainteneur du 2026-07-21 : la publication ne doit
  exiger aucun compte supplémentaire)
- Amende : D-018

### Contexte

D-018 décidait la publication sur le registre public npm ; celle-ci exige un compte npm
que le mainteneur ne souhaite pas créer. Le dépôt GitHub est public (D-019) avec CI verte
et tag signé : il peut porter la distribution à lui seul.

### Options

1. Maintenir l'exigence du registre npm (bloquée par la création de compte).
2. GitHub Packages (sans nouveau compte, mais nom scopé et configuration de registre
   côté consommateur).
3. Distribution par le dépôt GitHub : release GitHub avec tarball npm attaché,
   installation directe depuis git, et CDN jsDelivr servant le dépôt public.

### Décision

L'option 3 est retenue. La distribution officielle de `drake.css` 0.1.0 est :

- la **release GitHub** `v0.1.0` portant le tarball `drake.css-0.1.0.tgz` produit par
  `npm pack` (chaîne `prepack` complète : build et audits) ;
- l'installation **git** : `npm install github:Test-bot-cell/Drake-css-framework#v0.1.0` ;
- le **CDN** : `https://cdn.jsdelivr.net/gh/Test-bot-cell/Drake-css-framework@v0.1.0/dist/…`.

La publication sur le registre npm devient **optionnelle et non bloquante** : elle reste
possible plus tard selon D-018 si le mainteneur crée un compte, sans être exigée par
aucune phase. `private: true` reste levé (il ne concerne que `npm publish`, sans effet
sur les installations git/tarball).

### Conséquences

- Aucun compte ni credential supplémentaire ; toute la chaîne de distribution est
  opérée par le dépôt existant.
- Les consommateurs npm utilisent l'URL du tarball de release ou la référence git ; les
  intégrations sans bundler utilisent le CDN.
- Chaque release future répète le geste : tag signé, tarball packé et attaché, liens CDN
  au tag.

## D-022 — Variante de fontes en fichiers WOFF2 subsettés

- Date : 2026-07-21
- Statut : **Acceptée** (« go » du mainteneur du 2026-07-21 sur la proposition P1
  explicitement soumise, à la suite d'une revue de performance externe)
- Amende : D-006 et D-009 (clauses subset/renommage d'Inter, écrites sous l'hypothèse
  d'un Reserved Font Name absent en réalité) et le contrat d'assets Inter (FORK.md
  « fichiers interdits : `.woff` et `.woff2` autonomes »)

### Contexte — la règle actuelle et le problème vérifiable

La règle actuelle impose l'unique livraison d'Inter en `data:` URI
(`dist/css/drake-inter.css`) et interdit tout fichier de fonte autonome dans la
distribution. Mesuré sur la 0.1.0 : **731 Ko gzip** pour cette feuille (le base64 d'un
WOFF2 déjà compressé Brotli ne se recomprime pas), render-blocking, téléchargée
en tout-ou-rien — sans `unicode-range`, sans cache séparé des fontes, sans chargement
progressif. C'est le principal écart entre le contrat mobile-first affiché et le coût
réel au premier rendu.

### Options

1. Statu quo : mono-fichier uniquement (écart de performance assumé).
2. Fichiers WOFF2 subsettés uniquement (perd la distribution mono-fichier sans gestion
   de chemins, qui reste utile hors bundler).
3. **Double livraison** : la feuille `data:` URI est conservée comme option
   mono-fichier ; une variante `dist/css/drake-inter-files.css` + quatre fichiers
   `dist/fonts/*.woff2` subsettés (latin et latin-ext, roman et italique, axes
   variables conservés) avec `unicode-range` devient le **chargement recommandé**.

### Décision

L'option 3 est retenue. Concrètement :

- le subsetting est produit à la génération par la dépendance `subset-font` (HarfBuzz
  WebAssembly), épinglée en version exacte (D-008), depuis les WOFF2 officiels déjà
  vérifiés par empreinte — aucune chaîne système nouvelle ;
- les quatre fichiers produits sont des artefacts suivis, épinglés par empreinte
  SHA-256 dans `check-assets` ; tout autre fichier de fonte reste interdit ;
- licence : Inter ne déclare **aucun Reserved Font Name** (en-tête OFL vérifié) — le
  subset est une « Modified Version » licite sans renommage ; la bannière légale
  générée l'indique et embarque l'OFL complète, `licenses/Inter-OFL-1.1.txt` reste
  dans la packlist ; les fichiers légaux épinglés ne sont pas modifiés ;
- la documentation (FORK.md, README, MOBILE_FIRST_SEO) recommande la variante
  fichiers ; la feuille `data:` URI reste documentée comme option mono-fichier.

### Conséquences

- Une page latin réelle charge ~100-150 Ko de fontes au lieu de 731 Ko de CSS
  bloquante ; le cache des fontes devient indépendant des feuilles.
- Aucun impact sur les artefacts existants (aucun n'est modifié ni renommé) ; aucun
  impact CSP (mêmes origines) ; G9 couvre le déterminisme de la génération des
  subsets (double génération identique exigée).
- Le contrat « aucune requête tierce à l'exécution » est inchangé : les fichiers sont
  auto-hébergés à côté des feuilles.

## D-021 — Cibles tactiles : zones de saisie à 24 px, registre d'exceptions vidé

- Date : 2026-07-21
- Statut : **Acceptée** (arbitrage explicite du mainteneur du 2026-07-21 : les 11
  familles de composants ET les 2 familles de fixtures)
- Amende : D-017 (le registre d'exceptions créé par D-017 est vidé) ; première
  divergence assumée de la CSS des composants vis-à-vis de la référence pré-renommage

### Contexte

Le registre `docs/fork/HERITAGE_EXCEPTIONS.md` consignait 251 cibles interactives
< 24 px CSS (WCAG 2.5.8) héritées de l'amont. Une analyse par famille (six lots,
options chiffrées, croquis vérifiés en navigateur par diff `getBoundingClientRect`
avant/après sur les pages du catalogue) établit que chaque famille admet une zone de
saisie >= 24 px **sans changement visuel** (8 familles, identité au pixel prouvée) ou à
changement de boîte mineur sans peinture nouvelle (3 familles).

### Décision — table normative par famille

| Famille                                 | Technique retenue                                                                                                                                                                                                                              | Visuel |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| checkbox, radio                         | boîte 24×24 (toutes variantes), padding + `background-clip: content-box` ; anneau du thème converti `border` → `box-shadow` inset (y compris fragments inverse) ; marges compensatoires ; règle corrective `.drk-table td > :is(…):last-child` | aucun  |
| range                                   | hauteur de boîte 24 px compensée ; piste 3 px et poignée inchangées (l'UA centre)                                                                                                                                                              | aucun  |
| file-input                              | règle nouvelle : hauteur de boîte 24 px compensée                                                                                                                                                                                              | aucun  |
| dotnav                                  | padding + clip : point 10 px et anneau intacts, boîte 24×24, fondus via `box-shadow`                                                                                                                                                           | aucun  |
| thumbnav                                | plancher `min-width`/`min-height` 24 px (catalogue déjà conforme)                                                                                                                                                                              | aucun  |
| badge (lien)                            | bordure transparente + clip : padding-box 18 px et rayon d'origine préservés                                                                                                                                                                   | aucun  |
| button-text                             | padding vertical compensé (`padding-top` + marge négative)                                                                                                                                                                                     | aucun  |
| pagination                              | flèches portées à 24 px de haut (liens numériques déjà conformes)                                                                                                                                                                              | mineur |
| subnav                                  | boîte 24 px à encombrement compensé (marges négatives en `em`)                                                                                                                                                                                 | mineur |
| iconnav                                 | plancher min 24 px — extension du précédent déjà tranché pour `a.drk-icon`                                                                                                                                                                     | mineur |
| fixtures (fork-mobile-seo, fork-assets) | padding compensé au markup des deux pages, attentes épinglées mises à jour                                                                                                                                                                     | mineur |

Les croquis de référence détaillés (sélecteurs, valeurs, pièges vérifiés : fragments
inverse, `transition-property`, interaction `drk-table`) sont l'annexe d'analyse de la
campagne ; l'implémentation les suit fidèlement.

### Conséquences

- Divergence assumée de la CSS distribuée vis-à-vis de la référence pré-renommage :
  le contrat C0-C3 reste structurel (les snapshots C0/C1 capturent le DOM, inchangé) ;
  scénarios C2 et boucle C3 exigés verts sans recapture ; gates navigateur complets.
- `pnpm audit-heritage` devient le gate de non-régression tactile : zéro cible < 24 px,
  registre d'exceptions vidé (le fichier reste comme garde-fou : toute nouvelle
  exception exigerait une décision).
- Les attentes des fixtures G11/G13 sont re-épinglées pour les deux pages corrigées
  (divergence décidée) ; l'esthétique héritée est préservée partout ailleurs au pixel.

## Modèle d’une nouvelle décision

    ## D-NNN — Titre

    - Date : AAAA-MM-JJ
    - Statut : Proposée | Acceptée | Remplacée | Rejetée
    - Remplace : D-NNN, le cas échéant

    ### Contexte

    Problème vérifiable et contraintes.

    ### Options

    Alternatives examinées.

    ### Décision

    Règle retenue.

    ### Conséquences

    Compatibilité, migration, risques, licences et nouveaux gates.
