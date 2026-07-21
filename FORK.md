# UIkit TS — cadre du fork

## Statut du document

Ce document est le point d’entrée du fork. Il résume son identité et son contrat public.
Les règles détaillées et la procédure d’amendement se trouvent dans `docs/fork/`.

## Provenance

Le fork est établi à partir de :

- projet amont : [UIkit](https://github.com/uikit/uikit) ;
- version amont : `v3.25.20` ;
- commit de base immuable :
  `45cc430052ba967de8e9972507dee4d37701552d` ;
- licence du code amont : MIT ;
- remote amont réservé : `upstream=https://github.com/uikit/uikit.git`.

Le tag amont est un tag léger non signé. Son identité repose donc sur le couple version et
SHA ci-dessus. Le fork **DOIT** conserver cette provenance et ne jamais déplacer ni réutiliser
le tag amont.

## Intention

UIkit TS conserve le modèle de progressive enhancement de UIkit : un document HTML peut
déclarer ses composants avec les attributs `uk-*` ou `data-uk-*`, puis le runtime les
initialise, met à jour et détruit selon les mutations du DOM.

Le fork poursuit quatre objectifs :

1. convertir progressivement le runtime navigateur en TypeScript strict ;
2. préserver la compatibilité utile avec UIkit 3.25.20 ;
3. remplacer le catalogue d’icônes livré par Tabler Icons Outline 3.45.0 en CSS ;
4. adopter Inter 4.1 variable roman et italic comme typographie du framework, en CSS.

## Ce que « TypeScript » signifie

TypeScript est le langage source du runtime. Les navigateurs exécutent les fichiers
JavaScript générés dans `dist/js/` ; ces fichiers restent une sortie officielle et attendue.

La migration ne constitue pas une réécriture fonctionnelle. Elle conserve :

- l’initialisation automatique par observation du DOM ;
- les attributs, classes et options de composants ;
- les événements DOM et les méthodes d’instance ;
- l’API globale `UIkit` et les composants programmatiques ;
- les bundles historiques nécessaires aux consommateurs existants.

Les déclarations de types et une sortie ESM **PEUVENT** compléter les sorties historiques,
mais elles ne les remplacent pas sans décision de compatibilité.

## Place d’Elm

Elm n’est pas un langage source du cœur du fork. Son modèle d’application propriétaire d’un
arbre DOM, ses frontières d’interop et l’absence de FFI JavaScript arbitraire ne permettent
pas de remplacer le runtime UIkit sans changer de produit.

Après stabilisation du fork, un adaptateur Elm **POURRA** être créé dans un paquet et un
cycle de versions séparés. Il devra consommer l’API publique et le CSS du fork ; il ne devra
pas introduire Elm, des ports ou une seconde autorité d’état dans le runtime principal.

## Contrat de compatibilité

### Surfaces protégées

Le fork protège, dans cet ordre :

1. le rendu et la cascade des classes UIkit ;
2. le balisage déclaratif `uk-*` et `data-uk-*` ;
3. les comportements, événements et transitions des composants ;
4. le clavier, le focus, les rôles et états ARIA ;
5. le mode RTL et les breakpoints ;
6. l’API programmatique et le système de plugins documentés.

Une différence observable par rapport à UIkit 3.25.20 est une régression, sauf si elle est
enregistrée comme divergence acceptée.

### Divergences assumées

Les mécanismes de livraison suivants changent volontairement :

- le catalogue d’icônes applicatives est fourni par une CSS Tabler Outline, pas par un
  fichier `uikit-icons.js` contenant un registre SVG ;
- la police du framework est Inter 4.1 variable, roman et italic ;
- le source du runtime migre de JavaScript vers TypeScript.

Ces divergences **NE DOIVENT PAS** dégrader l’accessibilité ni modifier sans migration les
composants UIkit qui consomment des icônes internes.

Le composant générique `uk-svg` et les SVG historiques nécessaires à d’autres fonctions
peuvent subsister comme compatibilité UIkit. Ils ne font pas partie du catalogue Tabler
distribué.

## Contrat des assets

### Tabler Icons

- version : 3.45.0 exacte ;
- variante : Outline uniquement ;
- cardinalité attendue : 5 112 icônes ;
- sortie : `dist/css/uikit-tabler-icons.css` ;
- technique : `mask` et `-webkit-mask` avec `data:image/svg+xml` percent-encodé ;
- classes : `.uk-ti` et `.uk-ti-{nom}` ;
- fichiers interdits dans la distribution : tout asset Tabler `.svg` autonome.

La CSS contient donc des **données** SVG, mais la distribution ne contient aucun **fichier**
SVG Tabler.

### Inter

- version : 4.1 exacte ;
- faces : variable roman et variable italic ;
- sortie : `dist/css/uikit-inter.css` ;
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

## Licences

| Élément | Version | Licence | Obligation principale |
| --- | --- | --- | --- |
| UIkit | 3.25.20 | MIT | Conserver le copyright et le texte MIT amont |
| Tabler Icons | 3.45.0 | MIT | Conserver la licence et l’attribution dans les sorties ou notices |
| Inter | 4.1 | SIL OFL 1.1 | Conserver l’OFL et respecter le nom réservé « Inter » |
| Modifications du fork | version du fork | MIT, sauf mention contraire | Ne pas retirer les droits amont ou tiers |

Les fontes Inter ne sont ni modifiées ni sous-ensemblées. Une fonte dérivée devrait porter
un autre nom et ferait l’objet d’un amendement avant distribution.

Références légales conservées :

- [licence UIkit conservée dans le dépôt](LICENSE.md) ;
- [notices tierces](THIRD_PARTY_NOTICES.md) ;
- [licence MIT de Tabler Icons](licenses/Tabler-Icons-MIT.txt) ;
- [licence SIL OFL 1.1 d’Inter](licenses/Inter-OFL-1.1.txt).

## Reproductibilité

Une release doit pouvoir être reconstruite depuis :

- le commit du fork ;
- le lockfile ;
- Node.js 24.18.0 exact ;
- pnpm 11.4.0 ;
- les sources et versions tierces épinglées ;
- les générateurs versionnés.

Après génération, un second passage ne doit produire aucun diff. Les sorties non
reproductibles ou dont la provenance ne peut être démontrée bloquent la release.

## Carte documentaire

- `AGENTS.md` : règles immédiates pour toute intervention ;
- `docs/fork/CHARTER.md` : constitution et invariants ;
- `docs/fork/DEVELOPMENT.md` : cycle de développement et gates ;
- `docs/fork/UPSTREAM.md` : synchronisation avec UIkit ;
- `docs/fork/DECISIONS.md` : registre des décisions acceptées ;
- `docs/fork/ROADMAP.md` : séquence de livraison et critères de passage.

## Publication

Tant qu’un nom de paquet, un schéma de version et un remote `origin` propres au fork ne sont
pas décidés, le paquet **DOIT** rester privé et ne doit pas être publié sous l’identité
`uikit` de l’amont.
