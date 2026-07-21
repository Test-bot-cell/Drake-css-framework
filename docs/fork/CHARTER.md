# Charte du fork

## 1. Objet

La présente charte fixe les engagements durables de UIkit TS. Elle prévaut sur les pratiques
de commodité, les choix ponctuels d’implémentation et la feuille de route.

Le fork vise un framework de progressive enhancement :

- compatible avec UIkit 3.25.20 ;
- maintenu en TypeScript strict ;
- sans source JavaScript destinée au navigateur ;
- fondé sur un HTML complet rendu côté serveur ou prérendu ;
- conçu mobile-first à partir de 320 pixels CSS ;
- protecteur des fondamentaux du SEO technique ;
- autonome à l’exécution ;
- reproductible ;
- accessible ;
- explicite sur ses licences et divergences.

## 2. Vocabulaire normatif

- **DOIT** ou **NE DOIT PAS** : exigence bloquante.
- **DEVRAIT** ou **NE DEVRAIT PAS** : règle par défaut ; toute exception doit être justifiée.
- **PEUT** : possibilité compatible avec la charte.
- **Runtime** : code livré au navigateur pour initialiser et piloter les composants.
- **Source canonique** : fichier humainement modifié à partir duquel une sortie est générée.
- **Distribution** : contenu de `dist/` et contenu destiné à un paquet ou une release.
- **Compatibilité** : absence de différence observable non annoncée sur une surface protégée.
- **HTML initial** : corps de la réponse HTTP ou document prérendu avant toute exécution du
  runtime navigateur.
- **Intégration conforme** : page, exemple ou gabarit utilisant le framework et respectant le
  profil obligatoire de `MOBILE_FIRST_SEO.md`.

## 3. Base et traçabilité

Le socle historique est UIkit `v3.25.20` au commit
`45cc430052ba967de8e9972507dee4d37701552d`.

Cette base **DOIT** rester identifiable dans l’historique. Une mise à jour amont :

- **DOIT** conserver les commits et références amont ;
- **DOIT** être intégrée sur une branche dédiée ;
- **NE DOIT PAS** effacer les attributions ou transformer une synchronisation en import
  opaque ;
- **DOIT** suivre `UPSTREAM.md`.

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

Un adaptateur Elm futur est admissible seulement si :

- le cœur TypeScript est stable ;
- il vit dans un paquet séparé ;
- il dépend d’une API publique, pas d’internals ;
- ses ports ou éléments personnalisés ne deviennent pas nécessaires aux utilisateurs non Elm ;
- sa release peut être interrompue sans affecter le framework.

### 4.3 Compatibilité UIkit

La conversion TypeScript est un changement de maintenance, pas une autorisation de redesign.
Les surfaces suivantes sont protégées :

- sélecteurs, classes et variables de style documentés ;
- attributs de composants et coercition de leurs options ;
- initialisation, connexion, déconnexion et mise à jour automatiques ;
- événements et méthodes publics ;
- focus, clavier, ARIA et annonces accessibles ;
- LTR, RTL, responsive et préférences utilisateur ;
- API globale et usage programmatique documentés.

Cette compatibilité s'arrête lorsqu'un comportement historique contredit les piliers
HTML-first, mobile-first, TypeScript-only ou Tabler-only. La divergence **DOIT** alors être
inventoriée, couverte par une migration et ne peut jamais réintroduire la dépendance du
contenu au runtime, une source JavaScript navigateur ou un registre d'icônes SVG.

Une amélioration peut être acceptée si elle corrige un défaut démontré, mais elle **DOIT**
posséder un test, une note de migration lorsqu’elle est incompatible et une décision lorsque
le contrat change.

### 4.4 Assets épinglés et autonomes

Le catalogue d’icônes **DOIT** être Tabler Icons 3.45.0 Outline, soit 5 112 icônes. Sa sortie
est une CSS de masques contenant les tracés en données SVG encodées. Aucun fichier Tabler
SVG autonome n’est distribué.

Toutes les icônes UIkit historiques livrées, publiques comme internes, **DOIVENT** être
remplacées par une classe Tabler ou un alias CSS vers Tabler. Aucun bundle `uikit-icons.js`,
registre SVG JavaScript, objet de glyphes ou mécanisme d'injection d'un catalogue SVG
**NE DOIT** être distribué. Un utilitaire générique manipulant un SVG fourni par l'application
reste admissible s'il n'embarque aucun catalogue d'icônes.

La typographie **DOIT** être Inter 4.1 avec ses faces variables roman et italic intactes. Sa
sortie est une CSS monofichier contenant deux fontes WOFF2 encodées. Aucun fichier WOFF ou
WOFF2 autonome n’est distribué.

Les assets **NE DOIVENT PAS** nécessiter de réseau à l’exécution. Les versions, nombres de
faces, nombres d’icônes et empreintes **DOIVENT** être contrôlés automatiquement.

### 4.5 HTML-first, mobile-first et SEO technique

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

### 4.6 Accessibilité et internationalisation

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

### 4.7 Reproductibilité

La chaîne officielle repose sur Node.js 24.18.0 exact et pnpm 11.4.0. Le lockfile **DOIT** être
respecté avec une installation gelée.

Une release **DOIT** :

- être reconstruite depuis un checkout propre ;
- générer les mêmes contenus à entrées identiques ;
- ne laisser aucun diff après un second build ;
- contenir les bannières et notices légales requises ;
- ne contenir aucun fichier autonome interdit par le contrat d’assets.

### 4.8 Licences

Le fork **DOIT** préserver :

- la licence MIT et les mentions de UIkit ;
- la licence MIT de Tabler Icons ;
- la SIL Open Font License 1.1 d’Inter ;
- le nom réservé « Inter » tant que les fontes officielles intactes sont distribuées.

Un minificateur, un scopeur ou un empaqueteur **NE DOIT PAS** supprimer les notices
essentielles.

## 5. Niveaux de compatibilité

Les validations utilisent quatre niveaux :

| Niveau | Surface                  | Exigence                                                |
| ------ | ------------------------ | ------------------------------------------------------- |
| C0     | CSS statique et balisage | Rendu et cascade sans runtime                           |
| C1     | Déclaration `uk-*`       | Initialisation et options équivalentes                  |
| C2     | Interaction              | Événements, clavier, focus, observers et transitions    |
| C3     | Programmation            | API globale, méthodes, plugins et extensions documentés |

Une fonctionnalité n’est dite compatible que si tous les niveaux qui lui sont applicables
sont validés.

## 6. Catégories de changements

### Changement ordinaire

Correction ou maintenance sans modification du contrat. Il suit les gates usuels.

### Changement sensible

Modification du runtime, des assets, du build, du packaging, des licences, de l’accessibilité
ou de la synchronisation amont. Il exige :

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
