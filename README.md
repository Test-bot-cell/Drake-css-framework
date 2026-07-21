# Drake.css framework

Drake.css framework (forme courte autorisée : Drake.css) est un framework d’interface
HTML-first, maintenu comme fork local, privé et traçable du projet amont (voir
[FORK.md](FORK.md)). Depuis la décision D-012 du 2026-07-21, son identité publique est
entièrement renommée : API globale `Drake` (`window.Drake`), préfixe universel `drk-`
(classes `.drk-*`, attributs `drk-*` et `data-drk-*`, custom properties `--drk-*`) et
artefacts `dist/css/drake*.css` et `dist/js/drake*.js`. Le contrat de compatibilité est la
parité comportementale C0–C3 avec la référence interne pré-renommage, définie dans
[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md).

Le fork conserve le modèle de composants hérité tout en imposant quatre piliers de
distribution :

- runtime navigateur entièrement écrit en TypeScript strict ;
- Tabler Icons 3.45.0 Outline livré sous forme de masques CSS `data:image/svg+xml`
  (classe de base `.drk-ti`, icônes `.drk-ti-{nom}`, zéro fichier SVG distribué) ;
- Inter 4.1 variable roman et italic embarquée en `data:` URI WOFF2 dans une CSS, sans
  fichier `.woff`/`.woff2` autonome ;
- HTML-first, mise en page mobile-first à 320 px et gates SEO/performance.

À ces piliers s’ajoute le socle des styles (décision D-013, port achevé) : la cascade
est générée par [Panda.css](https://github.com/chakra-ui/panda), pilotée par
`panda.config.ts` et les modules TypeScript de `src/styles/` (tokens, fragments ordonnés
de la cascade héritée en `globalCss`). Aucune source Less ou SCSS ne subsiste. La CSS
distribuée reste statique, générée et déterministe : deux générations successives
**DOIVENT** produire un résultat identique.

Le contrat complet, les divergences et les licences sont décrits dans [FORK.md](FORK.md).
Le cycle de contribution sanctuarisé commence dans [AGENTS.md](AGENTS.md) et
[`docs/fork/DEVELOPMENT.md`](docs/fork/DEVELOPMENT.md).

## Statut de distribution

Le paquet npm s’appelle `drake.css` (titre : « Drake.css framework ») et porte la version
propre au fork `0.1.0` ; la base amont `3.25.20` n’est conservée qu’en métadonnée de
provenance de `package.json`. Le dépôt reste `private: true` tant qu’un remote `origin`
n’est pas décidé : il **NE DOIT PAS** être publié, ni voir ses assets chargés depuis un
CDN tiers ou amont.

Le JavaScript présent dans `dist/js/` est l’artefact compilé indispensable aux
navigateurs ; aucune source JavaScript frontend n’est maintenue hors de `dist/`. Les
composants individuels sont livrés sous `dist/js/components/`.

## Installation locale

La chaîne de référence utilise Node.js 24.18.0 exact et pnpm 11.4.0 :

```sh
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm verify` exécute les gates G0 à G14 et reste la seule validation faisant foi.
`pnpm watch` reconstruit les bundles TypeScript sans minification et la CSS pendant le
développement ; la commande ne remplace pas `pnpm verify`.

## Chargement recommandé

```html
<link rel="stylesheet" href="/dist/css/drake-inter.css" />
<link rel="stylesheet" href="/dist/css/drake.css" />
<script src="/dist/js/drake.js" defer></script>
```

Des variantes `drake.min.css`, `drake-rtl.css`, `drake-rtl.min.css` et `drake.min.js`
sont produites pour la minification et l’écriture droite-gauche.

La CSS principale contient les icônes Tabler internes utilisées par les composants. Une
page qui emploie directement le catalogue public (5112 icônes `.drk-ti-{nom}`) ajoute
explicitement :

```html
<link rel="stylesheet" href="/dist/css/drake-tabler-icons.css" />
```

Les alias historiques et la suppression volontaire de `Drake.icon.add` sont détaillés
dans [`docs/fork/ICON_MIGRATION.md`](docs/fork/ICON_MIGRATION.md).

## Développement

Les sources canoniques sont :

- `src/js/**/*.ts` pour le runtime, avec les points d’entrée `src/js/drake.ts` et
  `src/js/drake-core.ts` ;
- `panda.config.ts` et `src/styles/**/*.ts` pour les styles (tokens dans
  `src/styles/tokens.ts`, cascade dans `src/styles/core/` et `src/styles/theme/`) ;
- `src/icons/drake-tabler.json` et les générateurs sous `build/fork/` pour les assets.

`dist/` et `src/styles/tabler.ts` sont générés. Ils **NE DOIVENT** jamais recevoir une
correction manuelle. La dépendance `@pandacss/dev` est épinglée en version exacte (1.11.4).

## Provenance et licences

Ce fork provient d’un projet amont sous licence MIT ; son identité, sa version, son
commit de base et le contrat de traçabilité sont consignés dans [FORK.md](FORK.md) et
[`docs/fork/UPSTREAM.md`](docs/fork/UPSTREAM.md). La licence d’origine et ses mentions de
copyright sont intégralement préservées dans [LICENSE.md](LICENSE.md).

Tabler Icons reste sous MIT et Inter sous SIL Open Font License 1.1. Les attributions et
textes applicables se trouvent dans [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) et
`licenses/`.
