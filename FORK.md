# Drake.css framework — cadre du fork

## Statut du document

Ce document est le point d’entrée du fork. Il résume son identité et son contrat public.
Les règles détaillées et la procédure d’amendement se trouvent dans `docs/fork/`.

Depuis D-012, ce document est le **seul document racine** autorisé à nommer le projet amont.
Les autres emplacements autorisés sont énumérés dans « Règle de nommage documentaire »
ci-dessous ; partout ailleurs, on écrit « l’amont » ou « le projet amont (voir FORK.md) ».

## Provenance

Le fork est établi à partir de :

- projet amont : [UIkit](https://github.com/uikit/uikit) ;
- version amont : `v3.25.20` ;
- commit de base immuable :
  `45cc430052ba967de8e9972507dee4d37701552d` ;
- licence du code amont : MIT ;
- remote amont réservé : `upstream=https://github.com/uikit/uikit.git` ;
- tag local annoté : `fork-base/uikit-v3.25.20`.

Le tag amont est un tag léger non signé. Son identité repose donc sur le couple version et
SHA ci-dessus. Le fork **DOIT** conserver cette provenance et ne jamais déplacer ni réutiliser
le tag amont.

## Identité et renommage

### Nom du produit

Le fork s’appelle officiellement **Drake.css framework** ; la forme courte **Drake.css** est
autorisée. Cette identité a été décidée par le mainteneur le 2026-07-21 et enregistrée comme
D-012 dans `docs/fork/DECISIONS.md`.

### Table de renommage normative

Le renommage couvre l’intégralité des espaces publics. Il est normatif : un nom hérité de
l’amont qui subsiste dans une surface publique est une non-conformité.

| Espace public             | Avant (amont)                     | Après (fork)                      |
| ------------------------- | --------------------------------- | --------------------------------- |
| API globale JS/UMD        | `UIkit` (`window.UIkit`)          | `Drake` (`window.Drake`)          |
| Types internes            | `UIkit*`                          | `Drake*`                          |
| Classes CSS               | `.uk-*`                           | `.drk-*`                          |
| Attributs de composants   | `uk-*`                            | `drk-*`                           |
| Attributs data            | `data-uk-*`                       | `data-drk-*`                      |
| Custom properties         | `--uk-*`                          | `--drk-*`                         |
| Icônes, classe de base    | `.uk-ti`                          | `.drk-ti`                         |
| Icônes, classes unitaires | `.uk-ti-{nom}`                    | `.drk-ti-{nom}`                   |
| Catalogue d’icônes        | `src/icons/uikit-tabler.json`     | `src/icons/drake-tabler.json`     |
| CSS des icônes            | `dist/css/uikit-tabler-icons.css` | `dist/css/drake-tabler-icons.css` |
| CSS de la typographie     | `dist/css/uikit-inter.css`        | `dist/css/drake-inter.css`        |
| CSS principale            | `dist/css/uikit.css`              | `dist/css/drake.css`              |
| CSS minifiée              | `dist/css/uikit.min.css`          | `dist/css/drake.min.css`          |
| CSS RTL                   | `dist/css/uikit-rtl.css`          | `dist/css/drake-rtl.css`          |
| CSS RTL minifiée          | `dist/css/uikit-rtl.min.css`      | `dist/css/drake-rtl.min.css`      |
| JS principal              | `dist/js/uikit.js`                | `dist/js/drake.js`                |
| JS minifié                | `dist/js/uikit.min.js`            | `dist/js/drake.min.js`            |
| Composants JS             | `dist/js/components/`             | `dist/js/components/` (inchangé)  |
| Source d’entrée           | `src/js/uikit.ts`                 | `src/js/drake.ts`                 |
| Source du noyau           | `src/js/uikit-core.ts`            | `src/js/drake-core.ts`            |
| Paquet npm                | `uikit`                           | `drake.css`                       |

Tout artefact résiduel préfixé `uikit-` non listé ci-dessus, par exemple les variantes core
de la distribution, suit la même règle : `uikit-*` devient `drake-*`.

### Contrat de compatibilité redéfini par D-012

D-012 redéfinit la référence de parité : ce n’est plus l’API publique littérale de l’amont,
mais la **référence interne pré-renommage**, c’est-à-dire le dernier état vert de `fork/main`
avant D-012. Le fork **DOIT** maintenir la parité comportementale aux niveaux C0 à C3 avec
cette référence, modulo la table de renommage ci-dessus.

D-012 remplace D-004 et amende D-005 (espace de noms `.drk-ti`) et D-011 (noms des
artefacts).

### Règle de nommage documentaire

Le nom « UIkit », le domaine getuikit.com et le nom YOOtheme ne peuvent plus apparaître que
dans :

- `FORK.md`, le présent document ;
- `docs/fork/UPSTREAM.md` ;
- `docs/fork/DECISIONS.md` ;
- `docs/fork/CHANGELOG-uikit-amont.md` ;
- `LICENSE.md`, `THIRD_PARTY_NOTICES.md` et le répertoire `licenses/` ;
- les bannières légales générées ;
- la métadonnée de provenance de `package.json` ;
- le remote git `upstream`.

Partout ailleurs, documents et sources écrivent « l’amont » ou « le projet amont (voir
FORK.md) » sans le nommer. Les obligations légales MIT, dont le copyright de l’éditeur
amont, ne sont **JAMAIS** supprimées.

## Intention

Drake.css impose un modèle HTML-first de progressive enhancement : la réponse serveur ou le
document prérendu contient déjà tout le contenu, la navigation, les liens et les métadonnées.
Les attributs `drk-*` ou `data-drk-*` déclarent les comportements facultatifs que le runtime
TypeScript initialise, met à jour et détruit selon les mutations du DOM. Le chargement ou
l'échec du runtime ne conditionne jamais l'accès au contenu ni la navigation essentielle.

Le fork poursuit six objectifs :

1. porter intégralement le runtime navigateur en TypeScript strict, sans source JavaScript ;
2. préserver la parité comportementale C0 à C3 avec la référence interne pré-renommage
   (D-012) ;
3. remplacer toutes les anciennes icônes de l'amont par Tabler Icons Outline 3.45.0 en CSS ;
4. adopter Inter 4.1 variable roman et italic comme typographie du framework, en CSS ;
5. construire les styles depuis une base mobile de 320 pixels CSS avec enrichissements
   `min-width` ;
6. fournir des composants et exemples qui protègent l'indexabilité, l'accessibilité et les
   Core Web Vitals sans dépendre du JavaScript.

## Ce que « TypeScript » signifie

TypeScript strict est l'unique langage source du runtime navigateur. Les navigateurs
exécutent nécessairement les fichiers JavaScript compilés dans `dist/js/` ; ces fichiers
sont une sortie officielle et attendue, pas une source à maintenir. Les scripts Node.js qui
pilotent le build peuvent rester en JavaScript puisqu'ils ne sont ni exécutés ni distribués
comme frontend.

Le port ne constitue pas à lui seul une autorisation de réécriture fonctionnelle. Il
conserve :

- l’initialisation automatique par observation du DOM ;
- les attributs, classes et options de composants, sous leurs noms renommés (D-012) ;
- les événements DOM et les méthodes d’instance ;
- l’API globale `Drake` et les composants programmatiques ;
- les bundles nécessaires aux consommateurs existants, sous leurs noms renommés, sauf les
  catalogues d'icônes JavaScript explicitement remplacés par D-011.

Aucun fichier JavaScript source navigateur ne peut cohabiter avec TypeScript, même pendant
la migration. Un changement qui touche un module historique le porte d'abord en TypeScript
et les gates de release vérifient qu'aucune source JavaScript frontend ne subsiste.

Les déclarations de types et une sortie ESM **PEUVENT** compléter les sorties historiques,
mais elles ne les remplacent pas sans décision de compatibilité.

## Styles : Panda.css

Le port D-013 est **achevé depuis le 2026-07-21** : les styles ont quitté Less/SCSS pour
[Panda.css](https://github.com/chakra-ui/panda). La génération est pilotée par
`panda.config.ts` et les modules TypeScript de `src/styles/` : tokens (`tokens.ts`),
fragments ordonnés de la cascade héritée (`core/` et `theme/`, via `globalCss`), module
d’icônes généré (`tabler.ts`). Aucune source Less ou SCSS (mixin compris) ne subsiste ni ne
peut être réintroduite. La CSS distribuée reste statique, générée par `build/panda.js` et
déterministe : deux générations successives produisent des sorties identiques.

La parité du port avec la référence pré-Panda est prouvée par diff CSS normalisé sur les
quatre artefacts (`tests/fixtures/panda-parity-proof.json`, outil
`build/fork/css-parity.js`). La dépendance `@pandacss/dev` est épinglée en version exacte
(1.11.4).

D-013 amende D-007 et D-011 sur la source canonique des styles.

### Theming par propriétés personnalisées (D-016)

Le sous-ensemble sémantique des tokens est publié dans `:root` et consommé par la cascade
via `var(--drk-…, <valeur héritée>)`. Ces noms sont des **surfaces protégées** :

`--drk-color-text`, `--drk-color-emphasis`, `--drk-color-muted`, `--drk-color-inverse`,
`--drk-color-background`, `--drk-color-muted-background`, `--drk-color-primary`,
`--drk-color-secondary`, `--drk-color-success`, `--drk-color-warning`,
`--drk-color-danger`, `--drk-font-body`.

Une intégration rethème sans reconstruction ni réseau :

```css
:root {
    --drk-color-primary: #7c3aed;
}
```

Chemin mode sombre opt-in (extrait documenté, non distribué par défaut), cohérent avec la
mécanique `.drk-light`/`.drk-dark` :

```css
@media (prefers-color-scheme: dark) {
    :root {
        --drk-color-background: #111;
        --drk-color-text: #ccc;
        --drk-color-emphasis: #fff;
    }
}
```

Les media queries n'acceptant pas `var()`, les breakpoints restent des constantes de
génération (`src/styles/tokens.ts`).

## Place d’Elm

Elm n’est pas un langage source du cœur du fork. Le réexamen du 2026-07-21, mené à la
demande du mainteneur, reconduit les raisons de D-003 et est enregistré comme D-014 : le
modèle d’application d’Elm, propriétaire d’un arbre DOM, ses frontières d’interop et
l’absence de FFI JavaScript arbitraire restent incompatibles avec le progressive enhancement
HTML-first du fork. Aucune pertinence n’a été identifiée dans le cœur.

Après stabilisation du fork, un adaptateur Elm **POURRA** être créé dans un paquet et un
cycle de versions séparés. Il devra consommer l’API publique et le CSS du fork ; il ne devra
pas introduire Elm, des ports ou une seconde autorité d’état dans le runtime principal.

## Contrat de compatibilité

### Référence de parité

Depuis D-012, la référence de compatibilité est la référence interne pré-renommage : le
dernier état vert de `fork/main` avant D-012. Une différence observable par rapport à cette
référence, une fois la table de renommage appliquée, est une régression, sauf si elle est
enregistrée comme divergence acceptée.

### Surfaces protégées

Le fork protège, dans cet ordre :

1. le rendu et la cascade des classes `.drk-*` ;
2. le balisage déclaratif `drk-*` et `data-drk-*` ;
3. les comportements, événements et transitions des composants ;
4. le clavier, le focus, les rôles et états ARIA ;
5. le mode RTL et les breakpoints ;
6. l’API programmatique `Drake` et le système de plugins documentés.

### Divergences assumées

Les mécanismes de livraison suivants changent volontairement par rapport à l’amont :

- toutes les icônes historiques de l’amont, y compris celles utilisées en interne par les
  composants, sont remplacées par des classes ou alias CSS Tabler Outline ;
- aucun bundle d’icônes JavaScript, registre SVG JavaScript ou catalogue de chemins injectés
  par le runtime n’est distribué ;
- l’API de registre d’icônes héritée, `icon.add(name, svg)` sur l’objet global, est
  supprimée ; une extension fournit ses propres masques CSS, selon
  `docs/fork/ICON_MIGRATION.md` ;
- la police du framework est Inter 4.1 variable, roman et italic ;
- le source du runtime est exclusivement TypeScript ;
- les styles suivent une progression mobile-first et le contrat HTML-first/SEO décrit dans
  `docs/fork/MOBILE_FIRST_SEO.md` ;
- les espaces publics sont intégralement renommés selon la table normative du présent
  document (D-012) ;
- la source des styles migre vers Panda.css selon D-013.

Ces divergences **NE DOIVENT PAS** dégrader l’accessibilité. Les noms d'icônes historiques
éventuellement maintenus comme compatibilité sont des alias CSS vers Tabler, jamais un second
catalogue.

Un utilitaire générique opérant sur un SVG fourni par l'application peut subsister s'il ne
contient et ne distribue aucun registre d'icônes hérité de l'amont. Il ne constitue pas une
dérogation au remplacement intégral du catalogue livré.

## Contrat HTML-first, mobile-first et SEO

Une intégration conforme doit rester utile lorsque JavaScript est désactivé : contenu,
navigation par liens `<a href>`, titres, métadonnées, URL canonique et données structurées
sont présents dans le HTML initial. Le TypeScript ajoute uniquement des interactions non
bloquantes et conserve un repli HTML natif.

La CSS de base cible 320 pixels CSS et doit reflow sans défilement horizontal non essentiel.
Les dispositions plus larges sont des enrichissements exprimés avec `min-width`. Mobile et
bureau utilisent le même contenu, les mêmes titres, métadonnées, données structurées et
textes alternatifs ; seule la présentation diffère.

Le profil complet couvre les statuts HTTP, robots, canonical, liens explorables, données
structurées, images, titres, cibles tactiles et objectifs LCP/INP/CLS. Il est normatif dans
`docs/fork/MOBILE_FIRST_SEO.md`. Ce socle technique améliore l'explorabilité et l'expérience,
mais ne constitue pas une promesse de classement dans les moteurs de recherche.

## Contrat des assets

### Tabler Icons

- version : 3.45.0 exacte ;
- variante : Outline uniquement ;
- cardinalité attendue : 5 112 icônes ;
- catalogue épinglé : `src/icons/drake-tabler.json` ;
- sortie : `dist/css/drake-tabler-icons.css` ;
- technique : `mask` et `-webkit-mask` avec `data:image/svg+xml` percent-encodé ;
- classes : `.drk-ti` et `.drk-ti-{nom}` ;
- fichiers interdits dans la distribution : tout asset Tabler `.svg` autonome, registre SVG
  JavaScript et bundle d'icônes JavaScript hérité.

La CSS contient donc des **données** SVG, mais la distribution ne contient aucun **fichier**
SVG Tabler.

### Inter

- version : 4.1 exacte ;
- faces : variable roman et variable italic ;
- sortie : `dist/css/drake-inter.css` ;
- technique : deux sources WOFF2 encodées dans des `data:` URI ;
- fichiers interdits dans la distribution : `.woff` et `.woff2` autonomes.

La CSS contient donc des octets WOFF2 encodés, mais aucun fichier de fonte externe n’est
livré ou chargé à l’exécution.

### Conséquence CSP

Une application qui impose une Content Security Policy doit autoriser :

- `img-src data:` pour les masques d’icônes ;
- `font-src data:` pour Inter.

Le fork **NE DOIT PAS** contourner une CSP avec un CDN ou une récupération réseau. Une
intégration plus restrictive doit pouvoir reconstruire les assets selon sa propre politique,
sans modifier le contrat par défaut.

### Chargement recommandé

Inter et les styles du framework sont chargés explicitement afin que le navigateur découvre
la fonte sans imposer le catalogue complet d'icônes à chaque page :

```html
<link rel="stylesheet" href="/dist/css/drake-inter.css" />
<link rel="stylesheet" href="/dist/css/drake.css" />
```

`drake.css` contient les masques Tabler utilisés par les composants du noyau. Une page qui
emploie directement les classes publiques `.drk-ti-*` ajoute, et elle seule, le catalogue :

```html
<link rel="stylesheet" href="/dist/css/drake-tabler-icons.css" />
```

L'amélioration progressive peut ensuite charger `/dist/js/drake.js`, artefact compilé depuis
les seules sources TypeScript. Aucun bundle d'icônes JavaScript n'est requis.

## Licences

| Élément               | Version         | Licence                     | Obligation principale                                             |
| --------------------- | --------------- | --------------------------- | ----------------------------------------------------------------- |
| UIkit                 | 3.25.20         | MIT                         | Conserver le copyright et le texte MIT amont                      |
| Tabler Icons          | 3.45.0          | MIT                         | Conserver la licence et l’attribution dans les sorties ou notices |
| Inter                 | 4.1             | SIL OFL 1.1                 | Conserver l’OFL et respecter le nom réservé « Inter »             |
| Modifications du fork | version du fork | MIT, sauf mention contraire | Ne pas retirer les droits amont ou tiers                          |

Les fontes Inter ne sont ni modifiées ni sous-ensemblées. Une fonte dérivée devrait porter
un autre nom et ferait l’objet d’un amendement avant distribution.

Références légales conservées :

- [licence UIkit conservée dans le dépôt](LICENSE.md) ;
- [notices tierces](THIRD_PARTY_NOTICES.md) ;
- [licence MIT de Tabler Icons](licenses/Tabler-Icons-MIT.txt) ;
- [licence SIL OFL 1.1 d’Inter](licenses/Inter-OFL-1.1.txt).

Le renommage D-012 ne retire aucune mention légale : les bannières générées et les fichiers
listés ci-dessus continuent de nommer les ayants droit amont et tiers.

## Reproductibilité

Une release doit pouvoir être reconstruite depuis :

- le commit du fork ;
- le lockfile ;
- Node.js 24.18.0 exact ;
- pnpm 11.4.0 ;
- les sources et versions tierces épinglées ;
- les générateurs versionnés.

La chaîne officielle est inchangée : Node.js 24.18.0 exact, pnpm 11.4.0, `pnpm verify` et
les gates G0 à G14. Après génération, un second passage ne doit produire aucun diff ; cette
exigence s'applique aussi à la CSS générée par Panda.css (D-013). Les sorties non
reproductibles ou dont la provenance ne peut être démontrée bloquent la release.

## Carte documentaire

- `AGENTS.md` : règles immédiates pour toute intervention ;
- `docs/fork/CHARTER.md` : constitution et invariants ;
- `docs/fork/DEVELOPMENT.md` : cycle de développement et gates ;
- `docs/fork/ICON_MIGRATION.md` : alias hérités, usage Tabler CSS et rupture du registre
  SVG ;
- `docs/fork/MOBILE_FIRST_SEO.md` : profil HTML-first, mobile-first et SEO technique ;
- `docs/fork/NO_RUNTIME.md` : attentes par composant avec JavaScript désactivé ;
- `docs/fork/UPSTREAM.md` : synchronisation avec l’amont ;
- `docs/fork/DECISIONS.md` : registre des décisions acceptées ;
- `docs/fork/CHANGELOG-uikit-amont.md` : journal des changements hérité de l’amont, conservé
  pour référence ;
- `docs/fork/ROADMAP.md` : séquence de livraison et critères de passage.

La hiérarchie normative reste : `CHARTER.md` > `DECISIONS.md` > `AGENTS.md` > documents
spécialisés > `ROADMAP.md` et le présent document.

## Publication

Le paquet npm porte le nom `drake.css`, le titre « Drake.css framework » et la version
propre au fork `0.1.0`. La base amont 3.25.20 est conservée comme métadonnée de provenance
dans `package.json`.

Le versionnage du fork suit SemVer strict (D-017) : la stabilisation produit des tags
annotés signés `v0.1.0-rc.N`, l'acceptation finale `v0.1.0`. Les tags du fork restent
distincts des tags amont (`fork-base/uikit-v3.25.20`).

Le remote `origin` est décidé (D-017) : un dépôt GitHub privé `drake-css`, dont la
création et tout push restent soumis à un feu vert explicite du mainteneur, action par
action. Le paquet **DOIT** rester `private: true` tant qu'une publication npm n'est pas
explicitement décidée ; il ne doit être publié ni sous l'identité du fork ni sous celle de
l'amont sans cette décision.
