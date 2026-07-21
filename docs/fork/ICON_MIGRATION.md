# Migration des icônes

## Contrat

Tabler Icons 3.45.0 Outline est l’unique catalogue d’icônes livré. Les glyphes sont des
masques CSS colorés par `currentColor` : aucun élément SVG n’est injecté dans le DOM, aucun
fichier SVG Tabler n’est distribué et aucun registre de tracés n’est exécuté en JavaScript.

Le catalogue complet est volontairement opt-in :

```html
<link rel="stylesheet" href="/dist/css/uikit-tabler-icons.css" />
```

Une icône décorative associe la classe de base et son nom Tabler :

```html
<span class="uk-ti uk-ti-calendar" aria-hidden="true"></span>
```

Une icône qui porte seule une action reste dans un vrai lien ou bouton nommé :

```html
<button type="button" aria-label="Fermer">
    <span class="uk-ti uk-ti-x" aria-hidden="true"></span>
</button>
```

## Compatibilité UIkit 3.25.20

Les 162 anciens noms publics sont conservés comme alias CSS. Le runtime `uk-icon` ajoute
l’alias correspondant ; une intégration historique charge donc le catalogue CSS complet à
la place de `uikit-icons.js`. La table canonique et versionnée est
[`src/icons/uikit-tabler.json`](../../src/icons/uikit-tabler.json).

Six marques n’ont pas d’équivalent officiel dans Tabler 3.45.0. Leur alias utilise le symbole
Outline générique documenté ci-dessous ; ce choix est une divergence visuelle assumée et non
une imitation de marque :

| Alias UIkit | Icône Tabler        |
| ----------- | ------------------- |
| `500px`     | `photo`             |
| `gitter`    | `messages`          |
| `joomla`    | `brand-open-source` |
| `uikit`     | `components`        |
| `yelp`      | `stars`             |
| `yootheme`  | `palette`           |

L’alias `apple` pointe explicitement vers `brand-apple`, jamais vers l’icône de fruit
`apple`. Les icônes directionnelles internes inversent leur masque avec `:dir(rtl)`.

## Rupture volontaire du registre dynamique

`UIkit.icon.add(name, svg)` n’existe plus : le conserver réintroduirait exactement le
registre SVG JavaScript interdit par D-011. Une extension ajoute ses icônes comme règles de
masque CSS sous son propre préfixe. Un SVG appartenant au contenu de l’application peut
toujours être affiché avec l’utilitaire générique `uk-svg` ; il ne devient pas pour autant
une icône distribuée par le framework.

Une migration conforme supprime aussi tout chargement de `dist/js/uikit-icons.js`, fichier
qui n’est plus généré.
