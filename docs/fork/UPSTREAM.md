# Synchronisation avec UIkit

## 1. Objet

Ce document garantit qu’une mise à jour du projet amont UIkit reste traçable, réversible et
compatible avec les invariants de Drake.css framework (D-012, D-013, D-014).

### Nommage de l’amont

Ce document est l’un des rares emplacements autorisés à nommer UIkit. Le nom UIkit, ainsi que
getuikit.com et YOOtheme, ne peuvent apparaître que dans : `FORK.md`, `docs/fork/UPSTREAM.md`,
`docs/fork/DECISIONS.md`, `docs/fork/CHANGELOG-uikit-amont.md`, `LICENSE.md`,
`THIRD_PARTY_NOTICES.md`, `licenses/`, les bannières légales générées, la métadonnée de
provenance de `package.json` et le remote git `upstream`. Partout ailleurs, on écrit
« l’amont » ou « le projet amont (voir FORK.md) » sans le nommer.

Les références techniques Git qui matérialisent la provenance — remote `upstream`, tags amont
`vX.Y.Z`, tag local `fork-base/uikit-v3.25.20`, branches `sync/uikit-vX.Y.Z` — relèvent de la
même exception. Les obligations légales MIT, dont le copyright YOOtheme, ne sont **JAMAIS**
supprimées.

## 2. Références et remotes

### Base immuable

- version : `v3.25.20` ;
- commit : `45cc430052ba967de8e9972507dee4d37701552d` ;
- nature du tag amont : léger et non signé ;
- dépôt : `https://github.com/uikit/uikit.git`.

Avant la première intégration amont, le fork **DOIT** poser un tag local annoté
`fork-base/uikit-v3.25.20` sur ce SHA. Ce tag matérialise la base du fork ; il ne doit jamais
être déplacé. La base amont `3.25.20` survit uniquement comme métadonnée de provenance dans
`package.json` ; la version publiée du fork lui est propre (voir la section 10).

### Remotes

- `upstream` désigne exclusivement le dépôt UIkit officiel.
- `origin` désigne le futur dépôt publiable propre au fork.
- `upstream` est en lecture seule : aucun push, tag ou branche ne doit y être envoyé.
- La configuration **DOIT** désactiver explicitement le push vers `upstream` (URL de push
  invalide) afin qu’une erreur humaine échoue par défaut.
- Tant que `origin` n’est pas configuré, aucune publication distante n’est autorisée et le
  paquet reste `private: true`.

## 3. Branches

- `fork/main` reçoit uniquement des changements validés.
- `sync/uikit-vX.Y.Z` sert à une intégration amont déterminée.
- Une branche de synchronisation est courte, n’est pas une branche de développement
  fonctionnel et est supprimée après intégration.
- Les noms `upstream/*` sont réservés aux références de suivi et ne doivent pas servir aux
  changements propres au fork.

Une mise à jour amont **NE DOIT PAS** être fusionnée directement dans `fork/main`. Ce qui est
fusionné dans `fork/main` est l’amont déjà porté : traduit par la table de renommage D-012 et
aligné sur les sources de styles du fork (D-013). Aucun identifiant public amont brut ne doit
atteindre `fork/main`.

## 4. Veille avant synchronisation

Avant d’ouvrir une branche de sync :

1. lire le changelog et les notes de release depuis la dernière base ;
2. inventorier les commits sur `src/js/`, `src/less/`, le build, le packaging et les tests ;
3. relever les changements d’API, d’accessibilité, de navigateurs et de licences ;
4. vérifier si l’amont modifie les icônes, les fontes ou leur mécanisme de build ;
5. relever tout changement de rendu client, app shell, navigation, métadonnées ou SEO ;
6. relever les styles desktop-first, `max-width` de mise en page et écarts de reflow à
   320 pixels CSS ;
7. chiffrer le portage de styles : tout diff Less amont devra être traduit vers les
   fragments Panda de `src/styles/` (D-013) ;
8. décider si la mise à jour est utile et proportionnée au coût cumulé du portage
   TypeScript, de la traduction D-012 et du portage de styles.

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

1. charte et décisions du fork, dont D-012 (renommage), D-013 (styles) et D-014 (Elm hors
   du cœur) ;
2. parité comportementale C0 à C3 avec la référence interne pré-renommage — dernier état
   vert de `fork/main` avant D-012 — augmentée des changements amont acceptés lors des
   synchronisations déjà intégrées ;
3. correction ou amélioration amont ;
4. minimisation de la divergence structurelle.

Un conflit n’est jamais résolu par « accepter tout amont » dans une zone sanctuarisée.
Chaque résolution sensible doit être expliquée.

### 5.5 Porter les changements JavaScript vers TypeScript

Lorsque le fichier amont est encore JavaScript et son équivalent du fork TypeScript :

1. isoler le diff fonctionnel amont ;
2. écrire ou sélectionner le test qui le couvre ;
3. porter l’algorithme dans le TypeScript existant sans réintroduire un doublon JavaScript ;
4. conserver les noms publics — au renommage D-012 près — et l’ordre des effets ;
5. relire séparément le port fonctionnel, la traduction de noms et les adaptations de types.

Le JavaScript amont n’est jamais ajouté comme source transitoire : le port TypeScript et ses
tests sont une condition d’intégration. Le code généré par comparaison textuelle ne remplace
pas cette revue sémantique.

### 5.6 Traduire par la table de renommage D-012

Tout changement amont est porté **à travers** la table de renommage normative. Aucun
identifiant public amont ne traverse la synchronisation sans traduction :

| Espace amont                          | Espace du fork                               |
| ------------------------------------- | -------------------------------------------- |
| API globale JS/UMD `UIkit`            | `Drake` (`window.Drake`)                     |
| types internes `UIkit*`               | `Drake*`                                     |
| classes `.uk-*`                       | `.drk-*`                                     |
| attributs `uk-*` et `data-uk-*`       | `drk-*` et `data-drk-*`                      |
| custom properties `--uk-*`            | `--drk-*`                                    |
| icônes `.uk-ti` et `.uk-ti-{nom}`     | `.drk-ti` et `.drk-ti-{nom}`                 |
| entrées `uikit.js` et `uikit-core.js` | `src/js/drake.ts` et `src/js/drake-core.ts`  |
| artefacts `uikit*.css` et `uikit*.js` | `dist/css/drake*.css` et `dist/js/drake*.js` |

Une synchronisation **NE DOIT PAS** réintroduire :

- le préfixe `uk-` sous quelque forme que ce soit (classes, attributs, `data-uk-*`,
  `--uk-*`) ;
- l’API globale `UIkit` ou des types publics `UIkit*` ;
- un registre, bundle ou catalogue SVG JavaScript ;
- des sources JavaScript navigateur — TypeScript strict est l’unique source, le JavaScript
  compilé vit exclusivement sous `dist/`.

La traduction est une étape mécanique relue séparément du port fonctionnel. Les gates de la
section 5.9 vérifient l’absence de ces réintroductions.

### 5.7 Porter les changements de styles amont

L’amont écrit ses styles en Less ; le fork est intégralement sur Panda.css (D-013,
port achevé). Tout diff de styles amont est traduit vers la source Panda — les fragments
`globalCss` ordonnés de `src/styles/` et, le cas échéant, `panda.config.ts` et
`src/styles/tokens.ts` — en appliquant la table de renommage D-012, avec un diff CSS
normalisé (`build/fork/css-parity.js`) entre la sortie attendue et la sortie générée.

Une synchronisation ne réintroduit jamais de source Less ou SCSS, même transitoire. La
dépendance `@pandacss/dev` reste épinglée en version exacte.

Dans tous les cas, la CSS distribuée reste statique, générée et déterministe : deux
générations successives produisent des sorties identiques.

### 5.8 Régénérer

Les sources canoniques sont modifiées, puis les sorties sont entièrement régénérées.

- La source de styles canonique est la source Panda : `panda.config.ts` et
  `src/styles/**/*.ts`.
- `dist/` et `src/styles/tabler.ts` sont générés.
- La sortie historique `tests/js/test.js` n’est pas restaurée ; ses changements sont portés
  dans les sources TypeScript de test et compilés sous `dist/`.
- Les CSS `dist/css/drake-tabler-icons.css` et `dist/css/drake-inter.css` proviennent
  exclusivement de leurs générateurs : catalogue `src/icons/drake-tabler.json` pour Tabler
  Icons 3.45.0 Outline (5 112 icônes, masques `data:image/svg+xml`, zéro fichier SVG
  distribué) et faces Inter 4.1 variable roman et italic encodées WOFF2 en `data:` URI
  (zéro fichier `.woff` ou `.woff2` autonome).

Les sorties amont ne doivent pas être conservées si elles contredisent les sources du fork ou
réintroduisent des assets interdits.

Le même principe s’applique aux divergences constitutionnelles : une mise à jour ne peut
réintroduire un registre SVG JavaScript, le préfixe `uk-`, le global `UIkit`, une source
JavaScript navigateur, rendre du contenu indispensable côté client, restaurer une cascade
desktop-first ou différencier le contenu mobile et bureau.

### 5.9 Valider

La branche de sync exécute au minimum :

    pnpm install --frozen-lockfile
    pnpm exec eslint .
    pnpm exec tsc --noEmit
    pnpm compile
    pnpm compile-rtl
    pnpm build-assets
    pnpm check-assets
    git diff --exit-code

Ces commandes sont exécutées sous Node.js 24.18.0 exact et pnpm 11.4.0 ; `pnpm verify`
exécute la chaîne agrégée officielle. Le catalogue `tests/` est ensuite vérifié en LTR et
RTL, avec les gates G10 à G14 : sources frontend, HTML/SEO sans runtime, mobile-first,
performance et absence d’icônes héritées. Le contrôle inclut un smoke test visuel et les
tests d’interaction touchés.

La validation d’une sync inclut en outre l’audit de nommage : aucune occurrence de `UIkit`,
du préfixe `uk-` ou d’un artefact `uikit*` hors des emplacements autorisés par la section 1.

`git diff --exit-code` s’exécute après un second passage de génération ou depuis l’état
attendu qui inclut les sorties régénérées. Tout diff résiduel non expliqué bloque la sync.

## 6. Zones de conflit connues

| Zone                                        | Risque                                      | Règle                                                                                                          |
| ------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/js/api/`                               | cycle de vie et types centraux              | préserver le comportement puis adapter les types `Drake*`                                                      |
| `src/js/util/`                              | très grand rayon d’impact                   | tests ciblés et conversion isolée                                                                              |
| `src/js/drake.ts` et `src/js/drake-core.ts` | points d’entrée renommés face à l’amont     | porter le diff dans les entrées du fork, jamais recréer les fichiers amont                                     |
| sélecteurs, attributs et custom properties  | réintroduction du préfixe `uk-` amont       | traduire systématiquement par la table D-012                                                                   |
| `src/js/core/icon*` et `src/js/mixin/svg*`  | mécanisme d’icônes divergent                | ne pas réintroduire le catalogue SVG JS ; résoudre vers `.drk-ti`                                              |
| `src/less/components/variables.less`        | Inter comme police globale                  | conserver la variable du fork ; tokens Panda après migration                                                   |
| `src/less/` et breakpoints                  | cascade desktop-first ; double source D-013 | base 320 px et `min-width` ; porter vers Panda si migré                                                        |
| `panda.config.ts` et modules de styles TS   | zone propre au fork, inconnue de l’amont    | jamais « accepter tout amont » ; porter le diff Less à la main                                                 |
| exemples et gabarits                        | contenu ou navigation dépendants du runtime | préserver HTML initial, href, métadonnées et données structurées                                               |
| `build/` et `package.json`                  | générateurs d’assets et identité du paquet  | fusion manuelle ; versions épinglées ; conserver name `drake.css`, version du fork et métadonnée de provenance |
| `src/scss/` et `dist/`                      | fichiers générés                            | résoudre dans les sources puis régénérer                                                                       |
| `tests/js/test.js`                          | bundle navigateur historique hors `dist/`   | ne pas restaurer ; porter les tests en TypeScript                                                              |

## 7. Discipline visant à réduire la divergence

Les contributions propres au fork **DEVRAIENT** :

- conserver la topologie et les noms de modules amont, au renommage D-012 près ;
- éviter tout renommage au-delà de la table D-012 sans bénéfice de type ou de compatibilité ;
- séparer les traductions mécaniques (renommage, types) des modifications fonctionnelles ;
- ne pas reformater des fichiers non concernés ;
- garder un lien vers l’issue ou le commit amont lorsqu’une correction est portée ;
- proposer à l’amont les correctifs génériques qui ne dépendent pas des choix du fork ; un
  patch destiné à l’amont est exprimé dans l’espace de noms amont, jamais dans celui du fork.

Réduire la divergence ne permet pas de violer D-012, D-013, D-014 ni les décisions
TypeScript, Tabler, Inter, HTML-first, mobile-first ou SEO.

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
- la traduction D-012 : aucun préfixe `uk-`, aucun global `UIkit`, même en urgence ;
- l’audit des sources frontend et des registres SVG JavaScript ;
- le fonctionnement sans runtime, le reflow 320 pixels CSS et le SEO technique ciblé.

Les gates plus larges éventuellement différés doivent être exécutés avant la release suivante
et faire l’objet d’un suivi explicite.

## 10. Version et tags du fork

Le fork publie sous l’identité « Drake.css framework » (D-012) : paquet npm `drake.css`,
version propre au fork (`0.1.1` au dernier tag), base amont `3.25.20` conservée
exclusivement comme métadonnée de provenance dans `package.json`. Le dépôt est public et la
distribution est GitHub-first — release taguée avec tarball, installation `github:…#tag`,
CDN jsDelivr (D-019, D-020).

Le fork **NE DOIT PAS** publier un artefact modifié sous le numéro amont nu `3.25.20` ni sous
l’identité `uikit` de l’amont.

Les tags du fork sont annotés, immuables et clairement distincts des tags `vX.Y.Z` de
l’amont.

## 11. Pilote à blanc (D-023, 2026-07-22)

La procédure de ce document a été exercée une première fois **à blanc**, sans release
amont nouvelle, sur le delta historique **v3.25.16 → v3.25.20** (37 commits, quatre
releases correctives, 40 fichiers) — la plus petite fenêtre exerçant les deux axes de
portage. La base du fork étant exactement v3.25.20, tout changement de cette fenêtre
devait se retrouver dans `fork/main` : vérité terrain gratuite.

### Veille (§4) consignée

1. Changelog : quatre releases correctives — réactivité du slider, état actif du filtre
   combinant filtrage et tri, redémarrage de l'effet Ken Burns sous Safari, liens vidéo
   des pages de démonstration ; aucune fonctionnalité nouvelle.
2. Inventaire : 8 sources JavaScript (api, composants filter/slider/upload, mixins,
   utilitaires event/position), 1 source Less (slideshow) et son miroir SCSS, 6 fichiers
   build, packaging, CI, 8 pages de test, 8 artefacts `dist/` amont.
3. API, accessibilité, navigateurs, licences : aucun changement d'API publique ni de
   licence ; un correctif spécifique Safari ; support navigateurs inchangé.
4. Icônes et fontes : aucun changement d'assets ; le build d'icônes amont remplace la
   dépendance `glob` par un utilitaire interne (pipeline du fork indépendant).
5. Rendu, navigation, SEO : seuls les liens vidéo distants des pages de démonstration
   changent — le fork sert déjà ses médias localement.
6. Styles desktop-first et 320 px : diff Less limité au composant slideshow, aucun
   nouveau `max-width` de mise en page.
7. Chiffrage du portage : sans objet pour un delta déjà contenu dans la base ; la
   vérification ci-dessous en tient lieu.
8. Utilité : convergences notées au passage (`.cachebro` déjà ignoré par le fork,
   l'amont rejoint pnpm 11.4.0, la version exacte de la chaîne du fork).

### Classement et vérification

`node build/fork/sync-scout.js v3.25.16 v3.25.20 --output tests/fixtures/sync-pilot.json`
classe les 40 chemins : **porter 17** (toutes les destinations existent dans le fork),
**sans-objet 9** (artefacts amont régénérés chez nous, miroir SCSS supprimé par D-013),
**revue-manuelle 13** (CI, packaging, gabarits, build — politiques propres au fork),
**archiver 1** (journal amont).

Vérification hunk par hunk (18 lots, contre-vérification adversariale des verdicts
négatifs prévue au protocole — aucune n'a été nécessaire) :

- **44 hunks substantiels examinés : 32 retrouvés** dans la contrepartie du fork avec
  preuve fichier:ligne (traduction D-012 et migration TypeScript traversées, dont des
  équivalences non triviales : narrowing `AbortError`, booléanisation stricte du
  filtre) ; **12 sans objet par décision consignée** (8 : URLs vidéo distantes du
  vendeur amont, remplacées par le média local `tests/media/` exigé par D-012 ;
  4 : hunks des fichiers build supprimés par D-005/D-013) ; **zéro absent**.

### Conclusion

La chaîne provenance → renommage D-012 → migration TypeScript → port Panda D-013 n'a
perdu aucun changement amont de la fenêtre. Le coût réel d'un delta futur reste
proportionnel à sa taille, mais la machinerie de classement (`sync-scout`) et la
méthode de vérification sont désormais exercées : au premier delta réel, le rituel
commence par `sync-scout`, la veille §4, puis le portage lot par lot avec preuve.
