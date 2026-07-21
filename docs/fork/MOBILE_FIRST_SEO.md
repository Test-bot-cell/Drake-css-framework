# Profil HTML-first, mobile-first et SEO

## 1. Statut et portée

Ce document est normatif pour le framework Drake.css, ses composants, les exemples indexables,
les gabarits et toute intégration déclarée conforme. Il traduit la décision D-011, amendée par
D-012 pour les noms publics, en critères vérifiables.
Il établit un socle technique d'explorabilité, d'accessibilité et de performance ; il ne
promet aucun classement dans un moteur de recherche.

Le catalogue historique `tests/` est un laboratoire local non distribué, non une collection
d'URL indexables : ses pages ne sont pas tenues de répéter canonical et métadonnées SEO. Elles
restent soumises aux gates de source TypeScript, de runtime, d'accessibilité et de responsive.
Les fixtures `fork-mobile-seo.html` et `fork-assets.html` sont les références automatisées du
contrat ; leur preuve ne vaut pas, à elle seule, certification de chaque intégration consommatrice.

## 2. Architecture HTML-first

La réponse HTTP ou le HTML prérendu **DOIT** contenir avant toute exécution du runtime Drake :

- le contenu principal et secondaire utile ;
- les régions sémantiques, la navigation et une hiérarchie de titres compréhensible ;
- tous les liens nécessaires sous forme de `<a href="…">` ;
- le `<title>`, la meta description, le canonical et les directives robots ;
- les données structurées utiles et cohérentes avec le contenu visible ;
- les images éditoriales avec dimensions et alternatives appropriées.

Le TypeScript navigateur **DOIT** seulement améliorer ce document : ouverture, fermeture,
animation, validation ergonomique, synchronisation d'état ou chargement différé non
essentiel. Sans JavaScript, la lecture, la navigation et les actions essentielles **DOIVENT**
rester possibles par des primitives HTML. Un app shell vide, une route exclusivement cliente,
un lien sans `href`, un contenu principal injecté après interaction ou un `<noscript>` utilisé
comme copie de remplacement sont interdits.

Les contenus masqués par un onglet, un accordéon ou un dialogue **DOIVENT** déjà exister dans
le HTML initial. L'ordre DOM porte l'ordre de lecture ; CSS et TypeScript ne doivent pas créer
une sémantique contradictoire.

## 3. Source et distribution du runtime

- Toute source navigateur est TypeScript strict.
- Le JavaScript compilé indispensable est distribué uniquement sous `dist/`.
- Les scripts Node.js non distribués comme frontend peuvent rester en JavaScript.
- Aucun contenu SEO, lien, canonical, directive robots ou donnée structurée ne dépend de
  l'exécution du bundle.
- Les fixtures HTML-first de référence **DOIVENT** charger la page avec et sans le runtime
  Drake ; la matrice historique complète cette preuve par des smokes et scénarios
  d'interaction ciblés.

## 4. CSS mobile-first

La base sans media query **DOIT** être complète et utilisable à 320 pixels CSS. Elle définit
la typographie Inter (feuille `drake-inter.css`), le flux, les espacements, les contrôles, les
images et la navigation mobile. Les largeurs supérieures enrichissent cette base par des media
queries `min-width` ; une cascade desktop-first corrigée avec `max-width` est interdite pour la
mise en page.

Les media queries liées à `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`,
`hover`, `pointer`, à l'impression ou à l'orientation peuvent employer la condition qui
exprime correctement leur capacité et ne constituent pas une exception desktop-first.

Une requête `max-width` est admissible uniquement pour une API responsive **bornée** dont la
sémantique publique signifie explicitement « jusqu'à ce breakpoint », et non pour construire
la mise en page de base d'un composant. Cela couvre les utilitaires opt-in de visibilité ou
d'image de fond, sous réserve que :

- l'utilitaire figure avec sa condition exacte et sa justification dans
  `tests/fixtures/frontend-policy-allowlist.json` ;
- il ne modifie pas le flux, les dimensions ou l'ordre de la mise en page de base ;
- il ne soit jamais utilisé pour retirer du mobile un contenu, une action ou une métadonnée
  disponible sur bureau ;
- elle ne serve jamais à construire le comportement responsive d'un tableau.

Un tableau intrinsèquement bidimensionnel conserve ses en-têtes et cellules. Sa base mobile
fournit un défilement horizontal natif contenu dans le composant ou dans une région nommée et
focusable ; une règle `min-width` peut rétablir la présentation de table sur grand écran. Son
contenu ne doit ni être masqué ni être reconstruit par le runtime Drake.

Cette allowlist est fermée : toute nouvelle entrée exige une revue du contrat public. Une
règle desktop-first historique protégée peut y être inventoriée pour produire un rapport
actionnable, mais elle reste une dette et maintient G12 en échec jusqu'à sa migration.

La feuille `drake.css` contient les seuls masques Tabler nécessaires aux composants du noyau.
Le catalogue complet `drake-tabler-icons.css` est opt-in et **NE DOIT PAS** être chargé par
défaut lorsqu'une page n'emploie qu'un sous-ensemble d'icônes ; son coût doit entrer dans le
budget de la page qui le demande explicitement.

À 320 pixels CSS :

- le contenu horizontal **DOIT** reflow sans défilement dans les deux axes, sauf exception
  intrinsèque WCAG telle qu'un tableau ou une carte nécessitant une vue bidimensionnelle ;
- texte, commandes et icônes **NE DOIVENT PAS** être tronqués par défaut ;
- chaque cible interactive **DOIT** mesurer au moins 24 par 24 pixels CSS ou respecter et
  tester l'exception d'espacement WCAG 2.2 ;
- les images et médias **DOIVENT** rester dans leur conteneur ;
- l'ordre visuel **NE DOIT PAS** contredire l'ordre DOM et clavier.

Mobile et bureau partagent le même DOM sémantique, le même contenu, les mêmes actions,
titres, métadonnées, données structurées et textes alternatifs. Un accordéon ou une autre
présentation compacte est autorisé ; supprimer le contenu de la variante mobile ne l'est pas.

## 5. Contrat SEO technique

### 5.1 Métadonnées et indexation

Chaque URL indexable **DOIT** fournir :

- un `<title>` unique, descriptif et cohérent avec le titre visible ;
- une meta description utile et propre à la page ;
- un `link[rel="canonical"]` absolu, stable et cohérent avec la ressource indexable ;
- des directives `robots` et `X-Robots-Tag` intentionnelles, sans contradiction entre mobile
  et bureau ;
- un attribut `lang` correct sur l'élément `html`.

Les variantes non indexables **DOIVENT** être explicitement traitées. Le canonical ne sert
pas à corriger une mauvaise architecture d'URL et le fichier `robots.txt` ne remplace pas
une directive d'indexation.

### 5.2 HTTP et navigation

Le serveur **DOIT** répondre avec un statut qui décrit réellement la ressource : `2xx` pour
un succès, `3xx` pour une redirection, `404` ou `410` pour une absence, et le statut
d'authentification ou d'erreur approprié. Une page d'erreur avec `200` est un soft 404 et
bloque la conformité.

Toute destination découvrable **DOIT** être portée par un élément `<a>` avec un `href`
résolvable. Le TypeScript peut intercepter une navigation pour l'améliorer, mais l'URL doit
rester directement chargeable et retourner son HTML complet avec le bon statut.

### 5.3 Contenu, titres et données structurées

- Le contenu indexable est présent dans le HTML initial et identique sur mobile et bureau.
- Les régions HTML (`header`, `nav`, `main`, `aside`, `footer`) et les titres `h1` à `h6`
  structurent le document sans saut dicté uniquement par la taille visuelle.
- Le titre principal est identifiable et le nom de chaque section est explicite.
- Les données structurées sont rendues côté serveur ou prérendues, valides, utilisent les
  URL canoniques et décrivent seulement un contenu réellement présent pour l'utilisateur.
- Un composant ne génère pas de données structurées trompeuses et n'en duplique pas l'autorité.

### 5.4 Images et médias

- Chaque image informative possède un `alt` descriptif ; une image décorative utilise un
  `alt` vide. Une icône CSS décorative est ignorée des technologies d'assistance et une
  icône fonctionnelle est nommée par son contrôle.
- `width` et `height`, ou un ratio d'aspect réservé, évitent les décalages de mise en page.
- `srcset` et `sizes` sont utilisés lorsque plusieurs résolutions sont pertinentes ; mobile
  et bureau gardent des URL stables et une qualité suffisante.
- L'image LCP n'est pas paresseusement chargée. Le lazy-loading est réservé aux médias hors
  écran et ne doit pas exiger une interaction pour révéler un contenu primaire.

## 6. Performance et Core Web Vitals

Les objectifs au 75e percentile, séparément sur mobile et bureau, sont :

| Mesure | Objectif maximal | Dimension protégée              |
| ------ | ---------------: | ------------------------------- |
| LCP    |            2,5 s | chargement du contenu principal |
| INP    |           200 ms | réactivité aux interactions     |
| CLS    |              0,1 | stabilité visuelle              |

La release **DOIT** comparer une mesure reproductible en laboratoire à la référence du fork.
Les intégrations en production **DEVRAIENT** compléter ce gate avec des données terrain ; une
mesure de laboratoire ne prétend pas remplacer le 75e percentile réel, et TBT n'est qu'un
indicateur de diagnostic pour INP.

Le CSS critique, Inter et les icônes nécessaires au premier écran doivent être budgétés. Le
catalogue Tabler complet reste opt-in : une page **NE DEVRAIT PAS** charger les 5 112 masques
si elle n'en utilise qu'un sous-ensemble. Le runtime Drake est différé et ne bloque ni le
rendu du contenu ni la navigation.

## 7. Gates de conformité

Une modification concernée **DOIT** fournir les preuves suivantes :

1. audit automatique sans fichier JavaScript source navigateur ni registre SVG JS ;
2. capture et assertions du HTML HTTP avant runtime : contenu, liens, titres, metadata,
   canonical, robots et données structurées ;
3. navigation essentielle et contenu lisible avec JavaScript désactivé ;
4. statuts HTTP vérifiés pour succès, redirection, absence et erreur applicables ;
5. reflow à 320 pixels CSS, zoom à 400 %, cibles, clavier, LTR et RTL ;
6. comparaison mobile/bureau du contenu, des métadonnées, titres, données structurées et
   alternatives d'images ;
7. validation des données structurées et audit Lighthouse ou équivalent ;
8. mesure LCP/CLS/TBT de laboratoire et, lorsqu'elle existe, revue LCP/INP/CLS terrain.

Une vérification visuelle seule ne suffit pas. Une exception WCAG, une page volontairement
non indexable ou l'absence de donnée terrain **DOIT** être explicitement documentée.

## 8. Références normatives

- [IONOS — Qu'est-ce que le mobile first design ?](https://www.ionos.fr/digitalguide/sites-internet/web-design/mobile-first-la-nouvelle-approche-du-web-design/)
- [Google Search Central — Mobile-first indexing best practices](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google Search Central — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [W3C WAI — WCAG 2.2, Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [W3C WAI — WCAG 2.2, Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [web.dev — Web Vitals](https://web.dev/articles/vitals)
