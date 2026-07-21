# Feuille de route

## Statut

Cette feuille de route ordonne le travail de Drake.css framework ; elle n’assouplit aucun
gate. Son état initial est établi le 2026-07-21. Elle intègre les décisions D-012 (identité
Drake), D-013 (port Panda.css) et D-014 (Elm hors du cœur) acceptées le 2026-07-21.

Depuis D-012, la « référence » de compatibilité désigne la référence pré-renommage : le
dernier état vert de `fork/main` avant l’application de D-012. La parité comportementale
C0 à C3 s’apprécie contre cette référence interne, et non contre l’API publique littérale du
projet amont (voir FORK.md).

États autorisés :

- **Planifié** : périmètre accepté, travail non validé ;
- **En cours** : au moins une tâche active, critères de sortie non atteints ;
- **Bloqué** : obstacle explicite et responsable identifié ;
- **Terminé** : tous les critères de sortie possèdent une preuve ;
- **Abandonné** : décision enregistrée avec sa raison.

Une phase n’est pas marquée « Terminé » parce que ses fichiers existent. Ses critères de
sortie doivent être vérifiés sur un checkout propre.

## Principes de séquencement

1. La référence comportementale précède la conversion.
2. Le système de types précède la migration massive.
3. Les changements d’assets sont isolés des changements de runtime.
4. Les composants simples valident le modèle avant les grappes complexes.
5. Le HTML sans runtime, la base 320 pixels CSS et le SEO sont caractérisés à chaque phase,
   pas ajoutés en fin de migration.
6. Aucun lot publiable ne conserve une source JavaScript navigateur ni un registre SVG JS.
7. La compatibilité complète précède la première release stable.
8. Le renommage d’identité (D-012) est achevé et prouvé avant le port des styles (D-013) :
   un seul espace de noms est porté.
9. Le port Panda.css avance composant par composant avec preuve de parité ; `src/less` reste
   la source canonique tant que cette preuve n’est pas apportée.
10. L’adaptateur Elm éventuel vient après la stabilité et ne bloque aucun jalon du cœur.

## Phase 0 — Fondation et gouvernance

- État : **Terminé**

Preuves au 2026-07-21 : le tag annoté local pointe sur le SHA amont attendu, `upstream`
refuse les pushes, et `pnpm install --frozen-lockfile` réussit avec Node.js 24.18.0 et
pnpm 11.4.0.

### Portée

- conserver la base amont 3.25.20 et son SHA (voir FORK.md) ;
- créer le tag annoté de base amont ;
- établir `fork/main` et protéger `upstream` contre les pushes ;
- épingler Node.js 24.18.0 et pnpm 11.4.0 ;
- maintenir le paquet privé (`private: true`) tant que le remote `origin` n’est pas décidé ;
- adopter le corpus documentaire du fork.

### Critères de sortie

- les neuf documents normatifs sont cohérents et suivis ;
- `git rev-parse v3.25.20^{commit}` retourne le SHA de base ;
- le tag de base local annoté est présent ;
- la chaîne officielle est déclarée dans les fichiers de configuration ;
- une installation gelée réussit ;
- aucun remote publiable ambigu n’est configuré.

## Phase 1 — Référence de compatibilité

- État : **Terminé**

Avancement au 2026-07-21 : la matrice C0 à C3 est outillée et verte via `pnpm check-compat`
(G7) — C0/C1 : 176 snapshots structurels (88 pages × LTR/RTL) conformes aux fixtures
capturées depuis la référence pré-renommage ; C2 : scénarios d'interaction des grappes
prioritaires (modal/offcanvas/lightbox/tooltip, drop, slider, sticky) avec clavier, ARIA et
destruction sans résidu ; C3 : 58 composants du registre montés et détruits
programmatiquement sans résidu. Les deux derniers critères sont
couverts : chaque composant possède son attente documentée avec JavaScript désactivé
(docs/fork/NO_RUNTIME.md + attentes machine `tests/fixtures/compat/no-runtime.json`,
vérifiées par G7), et les écarts mobile-first/SEO hérités sont inventoriés comme
divergences à corriger (`pnpm audit-heritage` → `tests/fixtures/heritage-audit.json` :
22 débordements horizontaux à 320 px, 337 cibles < 24 px hors liens en ligne, 8 images
sans alt, 50 sans dimensions, 19 sauts de titres — dette suivie, non bloquante pour la
phase, bloquante pour la release via G12/G13 sur les surfaces conformes).

Depuis D-012, cette référence est figée comme référence pré-renommage : le dernier état vert
de `fork/main` avant renommage sert de comparaison C0 à C3 pour toutes les phases suivantes.

### Portée

- inventorier les surfaces C0 à C3 de la référence pré-renommage (dernier état vert de
  `fork/main` avant D-012, voir FORK.md) ;
- exécuter et documenter les pages de `tests/` ;
- établir les scénarios critiques automatisables ;
- enregistrer tailles et empreintes des bundles de référence ;
- créer les tests de mutation DOM, destruction, clavier, focus, ARIA et RTL.
- inventorier le contenu, la navigation et les replis disponibles sans JavaScript ;
- auditer la cascade à 320 pixels CSS et les breakpoints desktop-first à remplacer ;
- capturer le HTML initial, les statuts, liens, métadonnées, données structurées, images et
  titres ;
- établir les mesures de référence LCP, CLS et TBT des pages représentatives.

### Critères de sortie

- chaque composant runtime possède au moins un smoke test ;
- les grappes modal, drop, slider et sticky possèdent des tests d’interaction ;
- LTR et RTL sont couverts ;
- les comportements connus qui semblent anormaux sont enregistrés et non « corrigés » sans
  décision ;
- la référence peut comparer un build du fork au comportement de la référence pré-renommage.
- chaque composant possède une attente documentée avec JavaScript désactivé ;
- les écarts mobile-first et SEO de l’amont sont inventoriés comme divergences à corriger.

## Phase 2 — Pipeline d’assets

- État : **Terminé**

Preuves au 2026-07-21 : 5 112 masques Outline et 184 alias CSS sont générés, les 190 fichiers
SVG d’icônes historiques et le registre d’icônes JavaScript hérité sont supprimés, les
14 masques core gardent leur notice MIT après minification, Inter roman/italic est intégré, et
`pnpm check-assets` audite également la packlist npm et ses notices.

Note : la preuve initiale de cette phase a été apportée sous les noms de la référence
pré-renommage. La revalidation sous les noms définitifs D-012 est acquise au 2026-07-21 :
`pnpm check-assets` (contrats Tabler/Inter, packlist, empreintes) et `pnpm verify` passent
sur checkout propre avec les artefacts `drake-*` régénérés à l’identique.

### Portée

- générer Tabler Icons Outline 3.45.0 en CSS (masques `data:image/svg+xml`) depuis le
  catalogue `src/icons/drake-tabler.json` ;
- générer Inter 4.1 variable roman et italic en CSS, WOFF2 encodé en data: URI ;
- relier Inter à la source Less canonique ;
- ajouter les contrôles de versions, nombres, empreintes, licences et fichiers interdits ;
- documenter les besoins CSP.
- cartographier chaque ancienne icône héritée vers Tabler et générer les alias CSS
  nécessaires ;
- supprimer le registre d’icônes JavaScript hérité et tout registre, objet de glyphes ou
  injection SVG d’icônes.

### Critères de sortie

- `dist/css/drake-tabler-icons.css` contient exactement 5 112 entrées/classes d’icône
  Outline, y compris `brand-*`, sans variante filled ;
- les sélecteurs publics suivent `.drk-ti` et `.drk-ti-{nom}` ;
- `dist/css/drake-inter.css` contient exactement deux `@font-face` variables, roman et
  italic ;
- `dist/` et le paquet publiable ne contiennent aucun asset Tabler `.svg` autonome ni fichier
  `.woff`/`.woff2` autonome ;
- les bannières MIT et SIL OFL applicables sont conservées ;
- `pnpm check-assets` vérifie les versions et empreintes ;
- deux builds successifs sont identiques ;
- les composants internes restent accessibles avec le nouveau mécanisme d’icônes ;
- chaque ancienne icône livrée résout vers Tabler CSS ou possède une migration documentée ;
- aucun registre ou bundle d’icônes SVG JavaScript n’est présent dans la distribution.

## Phase 3 — Port intégral TypeScript

- État : **Terminé**

Preuves au 2026-07-21 : le port source est complet, `allowJs` est retiré, le typecheck strict
et le gate sans JavaScript auteur (G10) sont verts. Le dernier critère ouvert — chaque bundle
public produit depuis TypeScript sans différence C0 à C3 — est prouvé par la matrice G7
(`pnpm check-compat` : 176 snapshots C0/C1 LTR/RTL, scénarios C2, boucle C3 de 58 composants)
verte sur checkout propre.

### Portée

- établir une configuration TypeScript stricte sans `allowJs` pour le frontend ;
- connecter `tsc --noEmit` aux gates ;
- ajouter le gate automatisé qui refuse toute source JavaScript navigateur ;
- porter mécaniquement toutes les sources navigateur restantes de `.js` vers `.ts`, sans
  changement fonctionnel ;
- définir les types du runtime, du DOM et des composants ;
- créer `defineComponent` et `defineMixin` ou leurs équivalents ;
- adapter Rollup/esbuild aux entrées `.ts` (`src/js/drake.ts`, `src/js/drake-core.ts`) sans
  changer les bundles publics.

### Critères de sortie

- le typecheck strict est vert ;
- aucune source JavaScript destinée au navigateur n’existe hors des sorties compilées de
  `dist/` ;
- aucun `any` structurel ne masque le modèle de composants ;
- les sorties UMD de référence démarrent et s’initialisent automatiquement ;
- chaque bundle public est produit exclusivement depuis des sources TypeScript sans
  différence C0 à C3 avec la référence pré-renommage.

## Phase 4 — Utilitaires et noyau

- État : **Terminé**

Preuves au 2026-07-21 : `src/js/util/` et `src/js/api/` sont intégralement typés et le smoke
SSR/Node est automatisé. Les scénarios d’ajout, retrait, reconnexion DOM, mutation d’attribut
(montage, `$destroy`, `$reset`), composant custom et plugin `use()` sont couverts par la
grappe C2 `lifecycle-group` de la matrice G7 (156 assertions vertes au total), qui épingle le
contrat observé du runtime : un nœud retiré est déconnecté sans destruction, le retrait de
l’attribut composant détruit, la mutation de valeur réinitialise les props sans recréer
l’instance.

### Portée

- affiner les types de `src/js/util/` ;
- affiner les types de `src/js/api/` ;
- typer l’expando DOM, les options, la coercition, les observers et le scheduler ;
- conserver le cycle de vie et les hooks.

### Critères de sortie

- les utilitaires et le noyau ne contiennent plus de JavaScript source historique ;
- le contrôle strict est vert sans exception globale ;
- les tests d’ajout, retrait, reconnexion et mutation d’attribut réussissent ;
- les plugins et composants customisés documentés restent utilisables ;
- le contenu et la navigation essentiels du noyau restent disponibles sans runtime ;
- les bundles restent dans le budget de taille décidé à partir de la référence.

## Phase 5 — Mixins et composants core

- État : **En cours**

Avancement au 2026-07-21 : tous les mixins et composants core sont en TypeScript strict, les
icônes internes utilisent les masques CSS et des régressions navigateur couvrent animation,
props et cibles événement multiples. Les interactions C0 à C3 de chaque groupe sont prouvées
par la matrice G7. Dernier critère ouvert : le reflow à 320 pixels CSS — l’inventaire
`pnpm audit-heritage` recense 22 pages du catalogue avec débordement horizontal ; leur
résorption relève de la politique D-017 (correction côté catalogue) et conditionne la clôture.

### Portée

- typer les mixins transverses ;
- adapter d’abord les composants stateless ou simples ;
- adapter ensuite les groupes :
    - modal, offcanvas, lightbox et tooltip ;
    - drop, dropdown et dropnav ;
    - slider, slideshow et parallax ;
    - sticky, sortable et upload ;
- typer les entrées core.

### Critères de sortie

- chaque groupe passe ses tests C0 à C3 ;
- le clavier, le focus, ARIA et RTL sont validés ;
- aucun listener, observer ou nœud résiduel n’est détecté après destruction ;
- les conversions sont séparées des corrections fonctionnelles ;
- les composants core ne contiennent plus de JavaScript source historique ;
- chaque composant contient son HTML utile avant runtime, reflow à 320 pixels CSS et expose
  un repli natif pour l’action essentielle ;
- aucun composant core ne fabrique une icône depuis un registre SVG JavaScript.

## Phase 6 — Composants optionnels et types publics

- État : **En cours**

Avancement au 2026-07-21 : les composants optionnels et les sources du catalogue navigateur
sont portés en TypeScript ; la fixture mobile/SEO, les gates G10 à G13 et les bundles séparés
sont présents. Les déclarations consommateur sont livrées et testées : `dist/types/` est émis
par `pnpm compile-types` (entrée `types` de package.json, alias `drake-util` réécrit en
relatif, global UMD `window.Drake` déclaré) et le test de consommation `tests/types/`
compile sous tsc strict dans `pnpm typecheck` (G3). La sortie ESM est close par D-017 (non
livrée en 0.1.0). Dernier critère ouvert : le passage de tous les exemples du catalogue au
profil `MOBILE_FIRST_SEO.md`, porté par la résorption D-017.

### Portée

- typer les composants optionnels ;
- publier des déclarations `.d.ts` cohérentes (types publics `Drake*`) ;
- ajouter une sortie ESM si elle ne modifie pas les sorties historiques ;
- typer l’API globale `Drake`, les méthodes de composants et les plugins ;
- documenter les imports modulaires ;
- convertir les exemples et tests navigateur en sources TypeScript avec sorties sous `dist/` ;
- rendre les exemples côté serveur ou les prérendre avec contenu, navigation et métadonnées
  complets ;
- refondre la cascade en base 320 pixels CSS et enrichissements `min-width` ;
- ajouter les assertions SEO, sans runtime, reflow, cibles et budgets de performance.

### Critères de sortie

- tout le runtime navigateur source est TypeScript ;
- les déclarations passent des tests de consommation ;
- l’API globale (`window.Drake`), l’UMD et les composants séparés sous `dist/js/components/`
  restent compatibles avec la référence pré-renommage ;
- l’ESM, s’il est livré, ne duplique pas inutilement le runtime ;
- aucun consommateur historique couvert par la matrice ne régresse ;
- tous les exemples passent le profil `MOBILE_FIRST_SEO.md` ;
- la parité du contenu mobile/bureau et les objectifs Core Web Vitals sont démontrés.

## Phase 7 — Identité Drake (D-012)

- État : **En cours**

Avancement au 2026-07-21 : le renommage intégral est appliqué et prouvé — parité C0 à C3
contre la référence pré-renommage (G7), `dist/` régénéré sous les noms D-012 sans diff au
second build (G9), gates G0 à G14 verts sur checkout propre, notices amont préservées après
minification (G8). Le contrôle automatisé d’identité est en place (audit G10 de
`pnpm check-frontend`, allowlist des zones autorisées committée). Dernier critère ouvert :
« zéro occurrence hors zones autorisées » n’est pas encore atteint — les pages vidéo du
catalogue référencent `yootheme.com` (entrées temporaires de l’allowlist, condition de levée
documentée) ; leur purge relève de la résorption D-017 et conditionne la clôture.

### Portée

- appliquer la table de renommage normative de D-012 :
    - API globale JS/UMD `Drake` (`window.Drake`) et types internes `Drake*` ;
    - préfixe universel : classes `.drk-*`, attributs `drk-*`, `data-drk-*`, custom
      properties `--drk-*` ;
    - icônes : classe de base `.drk-ti`, icônes `.drk-ti-{nom}` ;
    - artefacts : `dist/css/drake.css`, `drake.min.css`, `drake-rtl.css`,
      `drake-rtl.min.css`, `drake-tabler-icons.css`, `drake-inter.css` ; `dist/js/drake.js`,
      `drake.min.js` et composants sous `dist/js/components/` ;
    - sources : `src/js/drake.ts` et `src/js/drake-core.ts` ;
    - paquet npm : name `drake.css`, title « Drake.css framework », version 0.1.0, base
      amont 3.25.20 conservée en métadonnée de provenance, `private: true` tant que le
      remote `origin` n’est pas décidé ;
- renommer les documents, exemples, tests et fixtures selon la même table ;
- restreindre le nom du projet amont aux seules zones autorisées (fichiers de provenance,
  licences, bannières légales générées, métadonnée de provenance et remote git, voir FORK.md
  et DECISIONS.md) et écrire « l’amont » partout ailleurs ;
- redéfinir le contrat de compatibilité : parité comportementale C0 à C3 avec la référence
  pré-renommage, et non plus avec l’API publique littérale de l’amont ;
- régénérer `dist/` intégralement sous les nouveaux noms.

### Critères de sortie

- zéro occurrence des préfixes hérités `uk-`, `data-uk-`, `--uk-` et du nom du projet amont
  hors des zones autorisées, vérifiée par un contrôle automatisé sur checkout propre ;
- la parité comportementale C0 à C3 est démontrée contre la référence pré-renommage ;
- `dist/` est régénéré sous les noms D-012 et deux builds successifs sont identiques ;
- les gates G0 à G14 sont verts sous Node.js 24.18.0 et pnpm 11.4.0 ;
- les notices de copyright du projet amont (voir LICENSE.md et THIRD_PARTY_NOTICES.md)
  restent intégralement présentes, y compris après minification.

## Phase 8 — Port Panda.css (D-013)

- État : **Terminé**

Preuves au 2026-07-21 : la cascade entière a été portée en une passe vers des fragments
`globalCss` ordonnés sous `src/styles/` avec `panda.config.ts` (tokens, `@pandacss/dev`
épinglé 1.11.4). Le diff CSS normalisé est vide sur les quatre artefacts (`drake.css`,
`drake-core.css` et leurs variantes RTL) face à la référence Less finale
(`tests/fixtures/panda-parity-proof.json`, outil `build/fork/css-parity.js`). `src/less`,
`src/scss`, `build/less.js`, `build/scss.js` et la dépendance `less` sont supprimés ; deux
générations successives produisent des sorties bit-à-bit identiques (G9) et `pnpm verify`
est vert de bout en bout, gates Chrome G10-G13 compris.

### Portée

- introduire `panda.config.ts` et les modules TypeScript de styles : tokens, semantic
  tokens, recettes, fonctions de style typées remplaçant les mixins Less, `globalCss` pour
  la cascade héritée ;
- épingler `@pandacss/dev` en version exacte lors de son introduction ;
- porter les styles composant par composant, chaque port étant prouvé par un diff CSS
  normalisé contre la sortie Less ;
- conserver `src/less` comme source canonique et `src/scss` comme sortie générée tant que le
  port n’est pas achevé ;
- supprimer Less/SCSS et les mixins une fois la parité intégralement prouvée ;
- ajouter le gate G15 (parité par diff CSS normalisé) ; le déterminisme de la génération
  Panda relève de G9.

### Critères de sortie

- chaque composant porté possède un diff CSS normalisé sans écart non décidé ;
- la CSS distribuée reste statique, générée et déterministe : deux générations successives
  sont identiques ;
- `src/less`, `src/scss` et les mixins Less sont supprimés ;
- le gate G15 est vert ;
- les artefacts publics `dist/css/*` conservent leurs noms et leur contrat.

## Phase 9 — Stabilisation et release candidate

- État : **En cours**

Avancement au 2026-07-21 : D-017 acte les arbitrages du mainteneur — remote `origin` =
dépôt GitHub privé (création et push différés à un feu vert explicite), versionnage SemVer
avec tags annotés signés `v0.1.0-rc.N` puis `v0.1.0`, résorption de la dette héritée côté
catalogue avec registre d'exceptions (`docs/fork/HERITAGE_EXCEPTIONS.md`), `private: true`
conservé tant qu'une publication npm n'est pas décidée, pas de sortie ESM en 0.1.0.

### Portée

- exécuter la matrice complète ;
- auditer les licences et la distribution ;
- décider le remote `origin` et lever `private: true` (le nom `drake.css`, le titre et la
  version 0.1.0 sont fixés par D-012) ;
- produire les notes de migration, dont la table de renommage `uk-` vers `drk-` ;
- mesurer tailles, performances d’initialisation et fuites ;
- tester la reconstruction dans un environnement propre.

### Critères de sortie

- les gates G1 à G14, et G15 introduit par D-013, sont verts sous Node.js 24.18.0 et
  pnpm 11.4.0 ;
- catalogue `tests/` validé en LTR et RTL ;
- distribution conforme aux contrats Tabler et Inter ;
- aucune source JavaScript navigateur hors `dist/` et aucun registre SVG JS ;
- HTML initial complet, navigation sans runtime, statuts HTTP et SEO technique validés ;
- reflow 320 pixels CSS, cibles et parité mobile/bureau validés ;
- budgets LCP/INP/CLS validés avec les preuves disponibles ;
- notices légales présentes après minification ;
- la dette Less/SCSS de D-013 est soldée ;
- deuxième build sans diff ;
- aucun blocage constitutionnel ou exception de release ouverte ;
- tag release du fork annoté et distinct des tags amont.

## Phase 10 — Maintenance amont

- État : **Planifié**

### Portée

- exécuter une synchronisation amont pilote selon `UPSTREAM.md` ;
- mesurer le coût réel du port JavaScript vers TypeScript et de l’application de la table de
  renommage D-012 aux correctifs portés ;
- améliorer les tests et la discipline de commits pour réduire les conflits ;
- décider la cadence de veille et d’intégration.

### Critères de sortie

- une release amont est acceptée, reportée ou rejetée avec une trace complète ;
- les correctifs portés conservent leur provenance ;
- les décisions du fork survivent à la synchronisation ;
- les gates restent reproductibles.

Cette phase devient ensuite une activité récurrente, pas une migration ponctuelle.

## Phase 11 — Adaptateur Elm facultatif

- État : **Planifié, non engagé**

Réexamen du 2026-07-21 (D-014) : les raisons de D-003 sont reconduites. La possession du DOM
par Elm reste incompatible avec le progressive enhancement HTML-first du cœur ; aucune
pertinence n’est identifiée dans le cœur. Un adaptateur reste possible en paquet séparé après
stabilisation.

### Condition d’entrée

La phase 9 est terminée et l’API publique TypeScript est stable.

### Portée autorisée

- paquet séparé ;
- helpers Elm produisant les classes et attributs publics `drk-*` ;
- ports ou custom elements confinés à l’application ou au paquet adaptateur ;
- documentation et tests propres ;
- aucun changement requis dans le cœur pour un utilisateur non Elm.

### Hors portée

- réécriture du runtime ;
- dépendance Elm dans le paquet principal ;
- remplacement de l’observation DOM TypeScript ;
- divergence du CSS ou des assets ;
- seconde implémentation non synchronisée des comportements.

### Critères de sortie

Ils seront définis par une décision dédiée si la phase est engagée. L’absence d’adaptateur
Elm ne bloque jamais une release du fork.

## Mise à jour de la feuille de route

Un statut est modifié dans le même changement que la preuve correspondante ou immédiatement
après. Toute modification de portée qui touche un invariant passe d’abord par
`DECISIONS.md`.

La feuille de route ne sert pas de journal de tâches détaillé ; les issues ou tickets portent
les unités de travail quotidiennes.
