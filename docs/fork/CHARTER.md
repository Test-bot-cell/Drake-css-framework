# Charte de Drake.css framework

## 1. Objet

La présente charte fixe les engagements durables de Drake.css framework (forme courte
admise : Drake.css), nom officiel du fork décidé par le mainteneur le 2026-07-21 (D-012).
Elle prévaut sur les pratiques de commodité, les choix ponctuels d’implémentation et la
feuille de route.

Le framework vise le progressive enhancement :

- comportementalement fidèle à sa référence interne pré-renommage (D-012) ;
- maintenu en TypeScript strict ;
- sans source JavaScript destinée au navigateur ;
- fondé sur un HTML complet rendu côté serveur ou prérendu ;
- conçu mobile-first à partir de 320 pixels CSS ;
- protecteur des fondamentaux du SEO technique ;
- stylé, à terme, depuis une source Panda.css typée produisant une CSS statique (D-013) ;
- autonome à l’exécution ;
- reproductible ;
- accessible ;
- explicite sur ses licences et divergences.

### 1.1 Identité et espaces de noms

- L’API globale navigateur est `Drake` (`window.Drake`) ; les types publics utilisent le
  préfixe `Drake*`.
- Le préfixe universel est `drk-` : classes `.drk-*`, attributs `drk-*` et `data-drk-*`,
  custom properties `--drk-*`.
- Les artefacts distribués portent des noms `drake*` (`dist/css/drake.css`,
  `dist/js/drake.js` et leurs déclinaisons).
- Le paquet npm se nomme `drake.css` ; sa version est propre au fork et la version de base
  amont n’apparaît que comme métadonnée de provenance.

En dehors des documents de provenance et des obligations légales recensés par `FORK.md`,
les documents et les sources **DOIVENT** désigner l’origine du code par « l’amont » ou
« le projet amont (voir `FORK.md`) », sans la nommer. La section 4.9 est le seul endroit de
la présente charte où le projet amont est nommé.

## 2. Vocabulaire normatif

- **DOIT** ou **NE DOIT PAS** : exigence bloquante.
- **DEVRAIT** ou **NE DEVRAIT PAS** : règle par défaut ; toute exception doit être justifiée.
- **PEUT** : possibilité compatible avec la charte.
- **Runtime** : code livré au navigateur pour initialiser et piloter les composants.
- **Source canonique** : fichier humainement modifié à partir duquel une sortie est générée.
- **Distribution** : contenu de `dist/` et contenu destiné à un paquet ou une release.
- **Référence interne pré-renommage** : dernier état vert de `fork/main` antérieur à
  l’application de D-012 ; elle porte le contrat de parité comportementale de la
  section 4.3.
- **Compatibilité** : absence de différence observable non annoncée sur une surface
  protégée, mesurée vis-à-vis de la référence interne pré-renommage.
- **HTML initial** : corps de la réponse HTTP ou document prérendu avant toute exécution du
  runtime navigateur.
- **Intégration conforme** : page, exemple ou gabarit utilisant le framework et respectant le
  profil obligatoire de `MOBILE_FIRST_SEO.md`.

## 3. Base et traçabilité

Le socle historique est le projet amont (voir `FORK.md`) à sa version `v3.25.20`, au commit
`45cc430052ba967de8e9972507dee4d37701552d`.

Cette base **DOIT** rester identifiable dans l’historique. Une mise à jour amont :

- **DOIT** conserver les commits et références amont ;
- **DOIT** être intégrée sur une branche dédiée ;
- **NE DOIT PAS** effacer les attributions ou transformer une synchronisation en import
  opaque ;
- **DOIT** suivre `UPSTREAM.md`.

La référence interne pré-renommage **DOIT** elle aussi rester identifiable, par un tag ou un
SHA enregistré : c’est elle, et non l’API publique amont littérale, qui définit la parité
exigée par la section 4.3 (D-012).

## 4. Piliers constitutionnels

### 4.1 TypeScript comme langage source

Le runtime navigateur du fork **DOIT** être intégralement écrit en TypeScript strict.

- Toute source exécutée dans un navigateur **DOIT** être TypeScript avant compilation.
- Aucun fichier JavaScript source navigateur **NE DOIT** subsister, y compris pendant la
  migration ou dans les tests exécutés par un navigateur.
- Le JavaScript compilé sous `dist/` reste le format d’exécution navigateur indispensable et
  la seule forme JavaScript frontend distribuable.
- Les scripts de build Node.js **PEUVENT** rester en JavaScript s'ils ne sont pas exécutés par
  un navigateur et ne sont pas distribués comme runtime.
- `allowJs` **NE DOIT PAS** couvrir le runtime navigateur.
- Les types publics **DOIVENT** décrire la réalité runtime ; ils ne peuvent promettre une
  sûreté que l’implémentation ne respecte pas.
- Le build **DOIT** séparer transpilation et contrôle de types.

Le port **DOIT** être découpé en unités comportementalement neutres, sans instaurer de
coexistence JavaScript/TypeScript. Une conversion et une évolution fonctionnelle ne doivent
pas être confondues dans le même changement.

### 4.2 Elm hors du cœur

Elm **NE DOIT PAS** remplacer TypeScript, piloter le cœur du runtime ni devenir une
dépendance de build obligatoire.

Ce pilier a été réexaminé le 2026-07-21 à la demande du mainteneur (D-014) : les raisons de
D-003 sont reconduites, la possession du DOM par Elm restant incompatible avec le
progressive enhancement HTML-first. Aucune pertinence n’a été identifiée dans le cœur.

Un adaptateur Elm futur est admissible seulement si :

- le cœur TypeScript est stable ;
- il vit dans un paquet séparé ;
- il dépend d’une API publique, pas d’internals ;
- ses ports ou éléments personnalisés ne deviennent pas nécessaires aux utilisateurs non Elm ;
- sa release peut être interrompue sans affecter le framework.

### 4.3 Compatibilité Drake

Le renommage D-012 et la conversion TypeScript sont des changements de maintenance, pas une
autorisation de redesign. Les surfaces protégées sont celles de Drake :

- sélecteurs, classes `.drk-*` et custom properties `--drk-*` documentés ;
- attributs `drk-*` et `data-drk-*` des composants et coercition de leurs options ;
- initialisation, connexion, déconnexion et mise à jour automatiques ;
- événements et méthodes publics ;
- focus, clavier, ARIA et annonces accessibles ;
- LTR, RTL, responsive et préférences utilisateur ;
- API globale `Drake` et usage programmatique documentés.

L’exigence est une parité comportementale, aux niveaux C0 à C3 applicables, avec la
référence interne pré-renommage, et non plus avec l’API publique amont littérale (D-012).
L’héritage comportemental des composants est conservé : à déclaration équivalente, un
composant Drake **DOIT** se comporter comme son homologue de la référence interne.

Cette compatibilité s'arrête lorsqu'un comportement hérité contredit les piliers
HTML-first, mobile-first, TypeScript-only ou Tabler-only. La divergence **DOIT** alors être
inventoriée, couverte par une migration et ne peut jamais réintroduire la dépendance du
contenu au runtime, une source JavaScript navigateur ou un registre d'icônes SVG.

Une amélioration peut être acceptée si elle corrige un défaut démontré, mais elle **DOIT**
posséder un test, une note de migration lorsqu’elle est incompatible et une décision lorsque
le contrat change.

### 4.4 Assets épinglés et autonomes

Le catalogue d’icônes **DOIT** être Tabler Icons 3.45.0 Outline, soit 5 112 icônes. Sa sortie
est `dist/css/drake-tabler-icons.css`, une CSS de masques contenant les tracés en données
SVG encodées (`data:image/svg+xml`). La classe de base est `.drk-ti` et chaque icône utilise
`.drk-ti-{nom}`. Aucun fichier SVG autonome n’est distribué.

Toutes les icônes héritées de l’amont, publiques comme internes, **DOIVENT** être remplacées
par une classe Tabler ou un alias CSS vers Tabler. Aucun bundle JavaScript d’icônes,
registre SVG JavaScript, objet de glyphes ou mécanisme d'injection d'un catalogue SVG
**NE DOIT** être distribué. Un utilitaire générique manipulant un SVG fourni par l'application
reste admissible s'il n'embarque aucun catalogue d'icônes.

La typographie **DOIT** être Inter 4.1 avec ses faces variables roman et italic intactes. Sa
sortie est `dist/css/drake-inter.css`, une CSS monofichier contenant deux fontes WOFF2
encodées en `data:` URI. Aucun fichier WOFF ou WOFF2 autonome n’est distribué.

Les assets **NE DOIVENT PAS** nécessiter de réseau à l’exécution. Les versions, nombres de
faces, nombres d’icônes et empreintes **DOIVENT** être contrôlés automatiquement.

### 4.5 Styles Panda.css

La source canonique cible des styles est Panda.css (D-013) : `panda.config.ts` et des
modules TypeScript de styles définissant les tokens, les semantic tokens, les recettes et
des fonctions de style typées, ainsi que `globalCss` pour la cascade héritée. Les fonctions
de style typées remplacent les mixins Less.

La CSS distribuée **DOIT** rester statique, générée et déterministe : aucune génération dans
le navigateur, aucune dépendance runtime, et deux générations à entrées identiques
**DOIVENT** produire des contenus identiques.

Transition : `src/less/` **DOIT** rester la source canonique et `src/scss/` rester généré
tant que le port Panda n’est pas achevé, composant par composant, avec preuve de parité par
diff CSS normalisé. Un composant ne bascule vers Panda qu’avec cette preuve. Les mixins Less
restants sont une dette qui bloque la release finale.

La dépendance `@pandacss/dev` **DOIT** être épinglée en version exacte dès son introduction.

### 4.6 HTML-first, mobile-first et SEO technique

Le HTML initial d'une intégration conforme **DOIT** contenir tout ce qui est nécessaire pour
lire, comprendre, parcourir et indexer la page : contenu principal et secondaire, navigation,
liens réels, titres, métadonnées, URL canonique et données structurées. Le runtime TypeScript
**DOIT** rester une amélioration progressive non bloquante ; un app shell vide, une route
exclusivement cliente ou un contenu chargé seulement après interaction est interdit.

La CSS **DOIT** être conçue depuis une base fonctionnelle à 320 pixels CSS. Les changements
de mise en page pour les largeurs supérieures **DOIVENT** utiliser des media queries
`min-width`. Les préférences utilisateur, l'impression et les capacités d'entrée peuvent
utiliser les requêtes adaptées à leur sémantique.

Mobile et bureau **DOIVENT** exposer le même contenu, les mêmes actions, titres, métadonnées,
données structurées et textes alternatifs. L'ordre DOM **DOIT** rester sémantique ; une
présentation différente ne peut pas masquer une information primaire sur mobile.

Le profil normatif `MOBILE_FIRST_SEO.md` **DOIT** couvrir et tester :

- `<title>`, meta description, canonical et robots ;
- statuts HTTP réels et absence de soft 404 ;
- liens `<a href>` explorables et navigation utilisable sans runtime ;
- données structurées cohérentes avec le contenu visible ;
- images stables, dimensionnées, responsives et correctement alternatives ;
- titres et régions sémantiques ;
- reflow, tailles de cibles et parité mobile/bureau ;
- Core Web Vitals sur mobile et bureau.

Les objectifs de référence, mesurés au 75e percentile, sont LCP ≤ 2,5 s, INP ≤ 200 ms et
CLS ≤ 0,1. Leur définition officielle évolue ; une modification des métriques stables ou de
leurs seuils est traitée comme une mise à jour normative documentée, jamais silencieuse.

### 4.7 Accessibilité et internationalisation

L’accessibilité est un gate de release :

- les composants interactifs **DOIVENT** rester utilisables au clavier ;
- les rôles, noms et états ARIA **DOIVENT** rester corrects ;
- un changement d’icône **NE DOIT PAS** supprimer un nom accessible ;
- les contenus horizontaux **DOIVENT** reflow à 320 pixels CSS, hors exceptions WCAG ;
- une cible interactive **DOIT** mesurer au moins 24 par 24 pixels CSS ou satisfaire une
  exception d'espacement WCAG 2.2 explicitement testée ;
- les animations **DOIVENT** respecter les choix du framework et les préférences prises en
  charge ;
- les comportements LTR et RTL **DOIVENT** être validés.

Une différence visuelle acceptable n’autorise pas une régression sémantique.

### 4.8 Reproductibilité

La chaîne officielle repose sur Node.js 24.18.0 exact et pnpm 11.4.0. Le lockfile **DOIT** être
respecté avec une installation gelée. La validation officielle est `pnpm verify`, qui exécute
les gates G0 à G14.

Une release **DOIT** :

- être reconstruite depuis un checkout propre ;
- générer les mêmes contenus à entrées identiques ;
- ne laisser aucun diff après un second build ;
- contenir les bannières et notices légales requises ;
- ne contenir aucun fichier autonome interdit par le contrat d’assets.

### 4.9 Licences

Le fork **DOIT** préserver :

- la licence MIT du projet amont et ses mentions de copyright, conservées à l'identique
  dans `LICENSE.md` (provenance détaillée dans `FORK.md`) ;
- la licence MIT de Tabler Icons ;
- la SIL Open Font License 1.1 d’Inter ;
- le nom réservé « Inter » tant que les fontes officielles intactes sont distribuées.

Ces obligations survivent au renommage des espaces publics (D-012) et ne sont jamais
supprimées. Un minificateur, un scopeur ou un empaqueteur **NE DOIT PAS** supprimer les
notices essentielles.

## 5. Niveaux de compatibilité

Les validations utilisent quatre niveaux :

| Niveau | Surface                  | Exigence                                                |
| ------ | ------------------------ | ------------------------------------------------------- |
| C0     | CSS statique et balisage | Rendu et cascade sans runtime                           |
| C1     | Déclaration `drk-*`      | Initialisation et options équivalentes                  |
| C2     | Interaction              | Événements, clavier, focus, observers et transitions    |
| C3     | Programmation            | API globale, méthodes, plugins et extensions documentés |

Une fonctionnalité n’est dite compatible que si tous les niveaux qui lui sont applicables
sont validés vis-à-vis de la référence interne pré-renommage (D-012).

## 6. Catégories de changements

### Changement ordinaire

Correction ou maintenance sans modification du contrat. Il suit les gates usuels.

### Changement sensible

Modification du runtime, des sources de styles, des assets, du build, du packaging, des
licences, de l’accessibilité ou de la synchronisation amont. Il exige :

- une analyse de compatibilité ;
- les tests ciblés ;
- une revue explicite des artefacts générés ;
- une note dans le changement livré.

### Changement constitutionnel

Modification d’un pilier de la section 4, d’une version sanctuarisée, d’une surface protégée
ou d’une règle de distribution. Il exige un amendement formel avant mise en œuvre.

## 7. Exceptions

Une exception temporaire :

- **DOIT** être la plus étroite possible ;
- **DOIT** avoir un responsable, une justification et une condition de suppression ;
- **DOIT** être enregistrée dans `DECISIONS.md` ;
- **NE DOIT PAS** permettre une release si elle touche une obligation légale, une provenance
  d’asset ou un fichier autonome interdit.

Une exception sans échéance de résolution est une modification de charte déguisée et n’est
pas recevable.

## 8. Procédure d’amendement

Un amendement constitutionnel **DOIT** être proposé dans un changement documentaire dédié
ou dans un commit documentaire distinct placé avant l’implémentation.

La proposition contient :

1. la règle actuelle ;
2. le problème vérifiable ;
3. au moins une alternative ;
4. l’impact sur compatibilité, accessibilité, sécurité, licences, taille et synchronisation ;
5. le plan de migration et de retour arrière ;
6. les nouveaux gates ;
7. la décision explicite du mainteneur.

Après acceptation :

- la charte est mise à jour ;
- une décision datée est ajoutée à `DECISIONS.md` ;
- `FORK.md`, `AGENTS.md` et la feuille de route sont harmonisés si nécessaire.

L’implémentation seule, même fusionnée, ne modifie jamais la présente charte.

## 9. Autorité de release

Le mainteneur du fork est responsable de l’acceptation finale. Il **NE DOIT PAS** déclarer une
release conforme lorsqu’un gate bloquant échoue ou n’a pas été exécuté.

En cas de conflit entre délai et charte, la release est différée.
