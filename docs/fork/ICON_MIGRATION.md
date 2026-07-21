# Migration des icônes

## Contrat

Tabler Icons 3.45.0 Outline est l’unique catalogue d’icônes livré par Drake.css. Les glyphes
sont des masques CSS colorés par `currentColor` : aucun élément SVG n’est injecté dans le
DOM, aucun fichier SVG Tabler n’est distribué et aucun registre de tracés n’est exécuté en
JavaScript. L’espace de noms `.drk-ti` relève de D-012, qui amende D-005.

Le catalogue complet est volontairement opt-in :

```html
<link rel="stylesheet" href="/dist/css/drake-tabler-icons.css" />
```

Une icône décorative associe la classe de base `.drk-ti` et son nom Tabler :

```html
<span class="drk-ti drk-ti-calendar" aria-hidden="true"></span>
```

Une icône qui porte seule une action reste dans un vrai lien ou bouton nommé :

```html
<button type="button" aria-label="Fermer">
    <span class="drk-ti drk-ti-x" aria-hidden="true"></span>
</button>
```

## Alias des noms historiques hérités

Les 162 noms historiques hérités du catalogue de l’amont (voir FORK.md) sont conservés comme
alias CSS. Le runtime `drk-icon` ajoute l’alias correspondant ; une intégration héritée
charge donc le catalogue CSS complet à la place du bundle d’icônes JavaScript de l’amont.
Conformément à D-012, la référence de parité est l’état interne pré-renommage : ces alias
facilitent la migration, ils ne rouvrent pas un second catalogue. La table canonique et
versionnée est [`src/icons/drake-tabler.json`](../../src/icons/drake-tabler.json).

Six marques n’ont pas d’équivalent officiel dans Tabler 3.45.0. Leur alias utilise le symbole
Outline générique documenté ci-dessous ; ce choix est une divergence visuelle assumée et non
une imitation de marque :

| Alias hérité | Icône Tabler        |
| ------------ | ------------------- |
| `500px`      | `photo`             |
| `gitter`     | `messages`          |
| `joomla`     | `brand-open-source` |
| `drake`      | `components`        |
| `yelp`       | `stars`             |
| `yootheme`   | `palette`           |

L’alias `apple` pointe explicitement vers `brand-apple`, jamais vers l’icône de fruit
`apple`. Les icônes directionnelles internes inversent leur masque avec `:dir(rtl)`.

## Rupture volontaire du registre dynamique

L’API historique de registre SVG de l’amont (voir FORK.md) n’existe pas dans Drake : la
conserver réintroduirait exactement le registre SVG JavaScript interdit par D-011. Une
extension ajoute ses icônes comme règles de masque CSS sous son propre préfixe, jamais sous
`drk-ti-*`. Un SVG appartenant au contenu de l’application peut toujours être affiché avec
l’utilitaire générique `drk-svg` ; il ne devient pas pour autant une icône distribuée par le
framework.

Une migration conforme supprime aussi tout chargement du bundle d’icônes JavaScript de
l’amont, fichier qui n’est plus généré.
