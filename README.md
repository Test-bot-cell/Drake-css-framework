# UIkit TS

UIkit TS est un fork local, privé et traçable de
[UIkit 3.25.20](https://github.com/uikit/uikit/releases/tag/v3.25.20). Il conserve le modèle
de composants UIkit tout en imposant quatre choix de distribution :

- runtime navigateur entièrement écrit en TypeScript strict ;
- Tabler Icons 3.45.0 Outline livré sous forme de masques CSS ;
- Inter 4.1 variable roman et italic embarquée dans une CSS ;
- HTML-first, mise en page mobile-first à 320 px et gates SEO/performance.

Le contrat complet, les divergences et les licences sont décrits dans [FORK.md](FORK.md).
Le cycle de contribution sanctuarisé commence dans [AGENTS.md](AGENTS.md) et
[`docs/fork/DEVELOPMENT.md`](docs/fork/DEVELOPMENT.md).

## Statut de distribution

Ce dépôt n’est pas le paquet npm officiel `uikit`. Il reste `private: true` tant qu’un nom,
une version et un remote propres au fork ne sont pas décidés. Il ne faut donc ni le publier
sous l’identité amont, ni charger ses assets depuis le CDN UIkit officiel.

Le JavaScript présent dans `dist/js/` est l’artefact compilé indispensable aux navigateurs ;
aucune source JavaScript frontend n’est maintenue hors de `dist/`.

## Installation locale

La chaîne de référence utilise Node.js 24.18.0 et pnpm 11.4.0 :

```sh
pnpm install --frozen-lockfile
pnpm verify
```

`pnpm watch` reconstruit les bundles TypeScript sans minification et la CSS Less pendant le
développement. La commande ne remplace pas la validation complète `pnpm verify`.

## Chargement recommandé

```html
<link rel="stylesheet" href="/dist/css/uikit-inter.css" />
<link rel="stylesheet" href="/dist/css/uikit.css" />
<script src="/dist/js/uikit.js" defer></script>
```

La CSS principale contient les icônes Tabler internes utilisées par les composants. Une page
qui emploie directement le catalogue public ajoute explicitement :

```html
<link rel="stylesheet" href="/dist/css/uikit-tabler-icons.css" />
```

Les alias historiques et la suppression volontaire de `UIkit.icon.add` sont détaillés dans
[`docs/fork/ICON_MIGRATION.md`](docs/fork/ICON_MIGRATION.md).

## Développement

Les sources canoniques sont :

- `src/js/**/*.ts` pour le runtime ;
- `src/less/` pour les styles ;
- `src/icons/uikit-tabler.json` et les générateurs sous `build/fork/` pour les assets.

`src/scss/` et `dist/` sont générés. Ils ne doivent jamais recevoir une correction manuelle.

## Provenance et licence

UIkit est un projet open source développé par
[YOOtheme](https://yootheme.com), distribué sous licence MIT. Ce fork part exactement du
commit `45cc430052ba967de8e9972507dee4d37701552d` de UIkit 3.25.20 et préserve sa licence dans
[LICENSE.md](LICENSE.md).

Tabler Icons reste sous MIT et Inter sous SIL Open Font License 1.1. Les attributions et
textes applicables se trouvent dans [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) et
`licenses/`.
