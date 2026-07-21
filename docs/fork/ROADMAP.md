# Feuille de route

## Statut

Cette feuille de route ordonne le travail ; elle n’assouplit aucun gate. Son état initial est
établi le 2026-07-21.

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
5. La compatibilité complète précède la première release stable.
6. L’adaptateur Elm éventuel vient après la stabilité et ne bloque aucun jalon du cœur.

## Phase 0 — Fondation et gouvernance

- État : **Terminé**

Preuves au 2026-07-21 : le tag annoté local pointe sur le SHA amont attendu, `upstream`
refuse les pushes, et `pnpm install --frozen-lockfile` réussit avec Node.js 24.18.0 et
pnpm 11.4.0.

### Portée

- conserver la base UIkit 3.25.20 et son SHA ;
- créer le tag annoté `fork-base/uikit-v3.25.20` ;
- établir `fork/main` et protéger `upstream` contre les pushes ;
- épingler Node.js 24.18.0 et pnpm 11.4.0 ;
- maintenir le paquet privé jusqu’à décision d’identité ;
- adopter le corpus documentaire du fork.

### Critères de sortie

- les sept documents normatifs sont cohérents et suivis ;
- `git rev-parse v3.25.20^{commit}` retourne le SHA de base ;
- le tag de base local annoté est présent ;
- la chaîne officielle est déclarée dans les fichiers de configuration ;
- une installation gelée réussit ;
- aucun remote publiable ambigu n’est configuré.

## Phase 1 — Référence de compatibilité

- État : **Planifié**

### Portée

- inventorier les surfaces C0 à C3 de UIkit 3.25.20 ;
- exécuter et documenter les pages de `tests/` ;
- établir les scénarios critiques automatisables ;
- enregistrer tailles et empreintes des bundles de référence ;
- créer les tests de mutation DOM, destruction, clavier, focus, ARIA et RTL.

### Critères de sortie

- chaque composant runtime possède au moins un smoke test ;
- les grappes modal, drop, slider et sticky possèdent des tests d’interaction ;
- LTR et RTL sont couverts ;
- les comportements connus qui semblent anormaux sont enregistrés et non « corrigés » sans
  décision ;
- la référence peut comparer un build du fork au comportement amont.

## Phase 2 — Pipeline d’assets

- État : **En cours**

Avancement au 2026-07-21 : les deux CSS, leurs générateurs et le gate d’intégrité sont en
place. L’adaptation des composants internes au nouveau mécanisme d’icônes reste à faire.

### Portée

- générer Tabler Icons Outline 3.45.0 en CSS ;
- générer Inter 4.1 variable roman et italic en CSS ;
- relier Inter à la source Less canonique ;
- ajouter les contrôles de versions, nombres, empreintes, licences et fichiers interdits ;
- documenter les besoins CSP.

### Critères de sortie

- `dist/css/uikit-tabler-icons.css` contient exactement 5 112 entrées/classes d’icône
  Outline, y compris `brand-*`, sans variante filled ;
- les sélecteurs publics suivent `.uk-ti` et `.uk-ti-{nom}` ;
- `dist/css/uikit-inter.css` contient exactement deux `@font-face` variables, roman et italic ;
- `dist/` et le paquet publiable ne contiennent aucun asset Tabler `.svg` autonome ni fichier
  `.woff`/`.woff2` autonome ;
- les bannières MIT et SIL OFL applicables sont conservées ;
- `pnpm check-assets` vérifie les versions et empreintes ;
- deux builds successifs sont identiques ;
- les composants internes restent accessibles avec le nouveau mécanisme d’icônes.

## Phase 3 — Fondation TypeScript

- État : **En cours**

Avancement au 2026-07-21 : le mode strict avec coexistence JavaScript est actif et deux
utilitaires pilotes sont migrés. Le modèle typé central des composants reste à construire.

### Portée

- ajouter la configuration TypeScript stricte et la coexistence `allowJs` ;
- connecter `tsc --noEmit` aux gates ;
- définir les types du runtime, du DOM et des composants ;
- créer `defineComponent` et `defineMixin` ou leurs équivalents ;
- adapter Rollup/esbuild aux entrées `.ts` sans changer les bundles publics.

### Critères de sortie

- un fichier TypeScript et un fichier JavaScript historique peuvent cohabiter dans un même
  bundle ;
- le typecheck strict est vert ;
- aucun `any` structurel ne masque le modèle de composants ;
- les sorties UMD de référence démarrent et s’initialisent automatiquement ;
- un composant pilote est migré sans différence C0 à C3.

## Phase 4 — Utilitaires et noyau

- État : **Planifié**

### Portée

- migrer `src/js/util/` ;
- migrer `src/js/api/` ;
- typer l’expando DOM, les options, la coercition, les observers et le scheduler ;
- conserver le cycle de vie et les hooks.

### Critères de sortie

- les utilitaires et le noyau ne contiennent plus de JavaScript source historique ;
- le contrôle strict est vert sans exception globale ;
- les tests d’ajout, retrait, reconnexion et mutation d’attribut réussissent ;
- les plugins et composants customisés documentés restent utilisables ;
- les bundles restent dans le budget de taille décidé à partir de la référence.

## Phase 5 — Mixins et composants core

- État : **Planifié**

### Portée

- migrer les mixins transverses ;
- migrer d’abord les composants stateless ou simples ;
- migrer ensuite les groupes :
  - modal, offcanvas, lightbox et tooltip ;
  - drop, dropdown et dropnav ;
  - slider, slideshow et parallax ;
  - sticky, sortable et upload ;
- migrer les entrées core.

### Critères de sortie

- chaque groupe passe ses tests C0 à C3 ;
- le clavier, le focus, ARIA et RTL sont validés ;
- aucun listener, observer ou nœud résiduel n’est détecté après destruction ;
- les conversions sont séparées des corrections fonctionnelles ;
- les composants core ne contiennent plus de JavaScript source historique.

## Phase 6 — Composants optionnels et types publics

- État : **Planifié**

### Portée

- migrer les composants optionnels ;
- publier des déclarations `.d.ts` cohérentes ;
- ajouter une sortie ESM si elle ne modifie pas les sorties historiques ;
- typer l’API globale, les méthodes de composants et les plugins ;
- documenter les imports modulaires.

### Critères de sortie

- tout le runtime navigateur source est TypeScript ;
- les déclarations passent des tests de consommation ;
- UMD, global et composants séparés restent compatibles ;
- l’ESM, s’il est livré, ne duplique pas inutilement le runtime ;
- aucun consommateur historique couvert par la matrice ne régresse.

## Phase 7 — Stabilisation et release candidate

- État : **Planifié**

### Portée

- exécuter la matrice complète ;
- auditer les licences et la distribution ;
- définir le nom du paquet, le remote `origin` et le schéma de version ;
- produire les notes de migration ;
- mesurer tailles, performances d’initialisation et fuites ;
- tester la reconstruction dans un environnement propre.

### Critères de sortie

- gates G1 à G9 verts sous Node.js 24.18.0 et pnpm 11.4.0 ;
- catalogue `tests/` validé en LTR et RTL ;
- distribution conforme aux contrats Tabler et Inter ;
- notices légales présentes après minification ;
- deuxième build sans diff ;
- aucun blocage constitutionnel ou exception de release ouverte ;
- tag release du fork annoté et distinct des tags amont.

## Phase 8 — Maintenance amont

- État : **Planifié**

### Portée

- exécuter une synchronisation amont pilote selon `UPSTREAM.md` ;
- mesurer le coût réel du port JavaScript vers TypeScript ;
- améliorer les tests et la discipline de commits pour réduire les conflits ;
- décider la cadence de veille et d’intégration.

### Critères de sortie

- une release amont est acceptée, reportée ou rejetée avec une trace complète ;
- les correctifs portés conservent leur provenance ;
- les décisions du fork survivent à la synchronisation ;
- les gates restent reproductibles.

Cette phase devient ensuite une activité récurrente, pas une migration ponctuelle.

## Phase 9 — Adaptateur Elm facultatif

- État : **Planifié, non engagé**

### Condition d’entrée

La phase 7 est terminée et l’API publique TypeScript est stable.

### Portée autorisée

- paquet séparé ;
- helpers Elm produisant les classes et attributs publics ;
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
