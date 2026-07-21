# Synchronisation avec UIkit

## 1. Objet

Ce document garantit qu’une mise à jour UIkit reste traçable, réversible et compatible avec
les invariants du fork.

## 2. Références et remotes

### Base immuable

- version : `v3.25.20` ;
- commit : `45cc430052ba967de8e9972507dee4d37701552d` ;
- nature du tag amont : léger et non signé ;
- dépôt : `https://github.com/uikit/uikit.git`.

Avant la première intégration amont, le fork **DOIT** poser un tag local annoté
`fork-base/uikit-v3.25.20` sur ce SHA. Ce tag matérialise la base du fork ; il ne doit jamais
être déplacé.

### Remotes

- `upstream` désigne exclusivement le dépôt UIkit officiel.
- `origin` désigne le futur dépôt publiable propre au fork.
- `upstream` est en lecture seule : aucun push, tag ou branche ne doit y être envoyé.
- Tant que `origin` n’est pas configuré, aucune publication distante n’est autorisée.

La configuration **DEVRAIT** désactiver explicitement le push vers `upstream` afin qu’une
erreur humaine échoue par défaut.

## 3. Branches

- `fork/main` reçoit uniquement des changements validés.
- `sync/uikit-vX.Y.Z` sert à une intégration amont déterminée.
- Une branche de synchronisation est courte, n’est pas une branche de développement
  fonctionnel et est supprimée après intégration.
- Les noms `upstream/*` sont réservés aux références de suivi et ne doivent pas servir aux
  changements propres au fork.

Une mise à jour amont **NE DOIT PAS** être fusionnée directement dans `fork/main`.

## 4. Veille avant synchronisation

Avant d’ouvrir une branche de sync :

1. lire le changelog et les notes de release depuis la dernière base ;
2. inventorier les commits sur `src/js/`, `src/less/`, le build, le packaging et les tests ;
3. relever les changements d’API, d’accessibilité, de navigateurs et de licences ;
4. vérifier si l’amont modifie les icônes, les fontes ou leur mécanisme de build ;
5. relever tout changement de rendu client, app shell, navigation, métadonnées ou SEO ;
6. relever les styles desktop-first, `max-width` de mise en page et écarts de reflow à
   320 pixels CSS ;
7. décider si la mise à jour est utile et proportionnée au coût de portage TypeScript.

Une version amont n’est jamais adoptée seulement parce qu’elle est plus récente.

## 5. Procédure d’intégration

### 5.1 Actualiser les références

Depuis un arbre de travail propre :

    git fetch upstream --tags --prune

Pour chaque tag candidat, résoudre le commit :

    git rev-parse refs/tags/vX.Y.Z^{commit}

Le SHA, la date, le type de tag et la plage de commits **DOIVENT** être consignés dans le
compte rendu de synchronisation.

Un tag non signé n’est pas présenté comme vérifié cryptographiquement. Sa provenance est
établie par le remote officiel, le SHA enregistré et la revue de la plage de commits.

### 5.2 Créer la branche dédiée

    git switch fork/main
    git switch -c sync/uikit-vX.Y.Z

La branche est créée depuis l’état stable du fork, jamais depuis une branche fonctionnelle.

### 5.3 Intégrer l’historique

L’intégration **DOIT** préserver l’ascendance amont, normalement par un merge explicite du
tag ou commit candidat. Le rebase de `fork/main` sur l’amont et l’import d’un snapshot sans
historique sont interdits.

Le commit de merge ne contient pas simultanément une refonte propre au fork.

### 5.4 Résoudre les conflits

L’ordre de priorité est :

1. charte et décisions du fork ;
2. compatibilité publique déjà garantie ;
3. correction ou amélioration amont ;
4. minimisation de la divergence structurelle.

Un conflit n’est jamais résolu par « accepter tout amont » dans une zone sanctuarisée.
Chaque résolution sensible doit être expliquée.

### 5.5 Porter les changements JavaScript vers TypeScript

Lorsque le fichier amont est encore JavaScript et son équivalent du fork TypeScript :

1. isoler le diff fonctionnel amont ;
2. écrire ou sélectionner le test qui le couvre ;
3. porter l’algorithme dans le TypeScript existant sans réintroduire un doublon JavaScript ;
4. conserver les noms publics et l’ordre des effets ;
5. relire séparément le port fonctionnel et les adaptations de types.

Le JavaScript amont n'est jamais ajouté comme source transitoire : le port TypeScript et ses
tests sont une condition d'intégration. Le code généré par comparaison textuelle ne remplace
pas cette revue sémantique.

### 5.6 Régénérer

Les sources canoniques sont modifiées, puis les sorties sont entièrement régénérées.

- `src/less/` est canonique pour les styles.
- `src/scss/` et `dist/` sont générés.
- La sortie historique `tests/js/test.js` n'est pas restaurée ; ses changements sont portés
  dans les sources TypeScript de test et compilés sous `dist/`.
- Les CSS Tabler et Inter proviennent exclusivement de leurs générateurs.

Les sorties amont ne doivent pas être conservées si elles contredisent les sources du fork ou
réintroduisent des assets interdits.

Le même principe s'applique aux divergences constitutionnelles : une mise à jour ne peut
réintroduire un registre SVG JavaScript, rendre du contenu indispensable côté client,
restaurer une cascade desktop-first ou différencier le contenu mobile et bureau.

### 5.7 Valider

La branche de sync exécute au minimum :

    pnpm install --frozen-lockfile
    pnpm exec eslint .
    pnpm exec tsc --noEmit
    pnpm compile
    pnpm compile-rtl
    pnpm build-assets
    pnpm check-assets
    git diff --exit-code

Ces commandes sont exécutées sous Node.js 24.18.0 et pnpm 11.4.0. Le catalogue `tests/` est
ensuite vérifié en LTR et RTL, avec les gates G10 à G14 : sources frontend, HTML/SEO sans
runtime, mobile-first, performance et absence d'icônes héritées. Le contrôle inclut un smoke
test visuel et les tests d’interaction touchés.

`git diff --exit-code` s’exécute après un second passage de génération ou depuis l’état
attendu qui inclut les sorties régénérées. Tout diff résiduel non expliqué bloque la sync.

## 6. Zones de conflit connues

| Zone | Risque | Règle |
| --- | --- | --- |
| `src/js/api/` | cycle de vie et types centraux | préserver le comportement puis adapter les types |
| `src/js/util/` | très grand rayon d’impact | tests ciblés et conversion isolée |
| `src/js/core/icon*` et `src/js/mixin/svg*` | mécanisme d’icônes divergent | ne pas réintroduire le catalogue SVG JS |
| `src/less/components/variables.less` | Inter comme police globale | conserver la variable du fork |
| `src/less/` et breakpoints | cascade amont potentiellement desktop-first | préserver la base 320 px et les enrichissements `min-width` |
| exemples et gabarits | contenu ou navigation dépendants du runtime | préserver HTML initial, href, métadonnées et données structurées |
| `build/` et `package.json` | TypeScript et générateurs d’assets | fusion manuelle, versions épinglées |
| `src/scss/` et `dist/` | fichiers générés | résoudre dans les sources puis régénérer |
| `tests/js/test.js` | bundle navigateur historique hors `dist/` | ne pas restaurer ; porter les tests en TypeScript |

## 7. Discipline visant à réduire la divergence

Les contributions propres au fork **DEVRAIENT** :

- conserver la topologie et les noms de modules amont ;
- éviter les renommages sans bénéfice de type ou de compatibilité ;
- séparer conversions mécaniques et modifications fonctionnelles ;
- ne pas reformater des fichiers non concernés ;
- garder un lien vers l’issue ou le commit amont lorsqu’une correction est portée ;
- proposer à l’amont les correctifs génériques qui ne dépendent pas des choix du fork.

Réduire la divergence ne permet pas de violer les décisions TypeScript, Tabler, Inter,
HTML-first, mobile-first ou SEO.

## 8. Acceptation, report ou rejet

Une mise à jour amont peut être :

- **acceptée** : tous les gates sont verts et les divergences sont maîtrisées ;
- **reportée** : valeur reconnue, mais dépendance ou test manquant ;
- **partiellement portée** : seuls des commits déterminés sont adaptés, avec provenance ;
- **rejetée** : incompatibilité constitutionnelle ou coût disproportionné.

Le report ou le rejet est enregistré dans `DECISIONS.md` si son impact architectural ou
durable le justifie.

## 9. Correctif urgent

Un correctif de sécurité amont peut utiliser une branche `sync/security-*` et une revue
accélérée. Il ne peut toutefois contourner :

- les licences ;
- le contrôle de types ;
- la compilation ;
- les tests ciblés ;
- la vérification des assets interdits ;
- l'audit des sources frontend et des registres SVG JavaScript ;
- le fonctionnement sans runtime, le reflow 320 pixels CSS et le SEO technique ciblé.

Les gates plus larges éventuellement différés doivent être exécutés avant la release suivante
et faire l’objet d’un suivi explicite.

## 10. Version et tags du fork

Le fork ne doit pas publier un artefact modifié sous le numéro amont nu `3.25.20`. Le schéma
de version, le nom du paquet et le remote `origin` doivent être décidés avant la première
publication.

Les tags du fork sont annotés, immuables et clairement distincts des tags `vX.Y.Z` de
l’amont.
