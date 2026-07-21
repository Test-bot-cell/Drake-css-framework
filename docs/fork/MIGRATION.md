# Notes de migration vers Drake.css framework

Ce document accompagne une intégration venant de l'amont (UIkit 3.25.20, voir `FORK.md`)
ou de l'état pré-renommage du fork vers Drake.css framework 0.1.0. La compatibilité du
fork est une parité comportementale C0-C3 avec la référence interne pré-renommage
(D-012) : à balisage équivalent, le comportement est le même ; seuls les espaces de noms
publics changent.

## Table de renommage normative (D-012)

| Surface                 | Avant          | Après           |
| ----------------------- | -------------- | --------------- |
| API globale JS et UMD   | `window.UIkit` | `window.Drake`  |
| Types publics           | `UIkit*`       | `Drake*`        |
| Classes CSS             | `.uk-*`        | `.drk-*`        |
| Attributs de composants | `uk-*`         | `drk-*`         |
| Attributs data          | `data-uk-*`    | `data-drk-*`    |
| Custom properties       | `--uk-*`       | `--drk-*`       |
| Icônes, classe de base  | `.uk-icon`     | `.drk-ti`       |
| Icônes, entrées         | nom d'icône JS | `.drk-ti-{nom}` |

L'événement d'initialisation du runtime devient `drake:init` et l'expando interne des
instances `__drake__`. Les événements de composants non préfixés (`show`, `hide`,
`active`, `inactive`, `beforeshow`, …) sont inchangés.

## Artefacts distribués

| Avant (amont)    | Après                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `uikit.css`      | `dist/css/drake.css` (`drake.min.css`)                                                                                                     |
| `uikit-core.css` | `dist/css/drake-core.css`                                                                                                                  |
| RTL              | `dist/css/drake-rtl.css`, `drake-core-rtl.css`                                                                                             |
| `uikit.js`       | `dist/js/drake.js` (`drake.min.js`)                                                                                                        |
| `uikit-core.js`  | `dist/js/drake-core.js`                                                                                                                    |
| `uikit-icons.js` | `dist/css/drake-tabler-icons.css` (CSS pur)                                                                                                |
| fontes du thème  | `dist/css/drake-inter-files.css` + `dist/fonts/*.woff2` (subsets `unicode-range`, recommandé) ou `dist/css/drake-inter.css` (mono-fichier) |

Deux différences de fond, décidées avant le renommage :

- **Icônes** : le registre SVG JavaScript n'existe plus. Les icônes sont des masques CSS
  Tabler Outline (`.drk-ti .drk-ti-{nom}`), chargés par une feuille dédiée. Chaque
  ancienne icône livrée résout vers un alias documenté : voir `ICON_MIGRATION.md`.
  Une icône porteuse de sens reçoit un `aria-label` (l'élément n'embarque plus de SVG).
- **Typographie** : Inter variable (roman et italique) est embarquée en `data:` URI ;
  aucun fichier de fonte autonome, aucune requête réseau.

## Recette mécanique

Sur un balisage existant, la migration est un remplacement textuel ordonné (le plus
spécifique d'abord) :

1. `data-uk-` → `data-drk-`
2. `--uk-` → `--drk-`
3. `uk-` → `drk-` (classes et attributs de composants)
4. `UIkit` → `Drake` (API globale, `UIkit.modal(...)` → `Drake.modal(...)`)

Puis, pour les icônes, remplacer chaque `uk-icon="icon: {nom}"` par la paire de classes
`class="drk-ti drk-ti-{alias}"` selon la table d'`ICON_MIGRATION.md`.

## Theming

Les variables Less de l'amont n'existent plus (cascade générée par Panda.css, D-013). Le
theming d'intégration passe par les propriétés personnalisées publiées (D-016) :
redéfinir `--drk-color-*` et `--drk-font-body` dans `:root` suffit, sans reconstruction —
contrat détaillé et exemple mode sombre dans `FORK.md`. Une personnalisation plus
profonde passe par les tokens de `src/styles/tokens.ts` et une régénération.

## TypeScript

Le paquet publie ses déclarations (`types` de `package.json`) : `import Drake from
'drake.css'` est typé, les types publics `Drake*` s'importent depuis l'entrée du paquet,
et le global UMD `window.Drake` est déclaré. Aucun `@types/*` tiers n'est nécessaire.

## Vérification d'une migration

Un contrôle utile après migration d'une intégration : rechercher `uk-`, `data-uk-`,
`--uk-` et l'ancien nom global dans les sources migrées — le dépôt du fork applique ce
même contrôle à lui-même (audit d'identité G10, `DEVELOPMENT.md`).
