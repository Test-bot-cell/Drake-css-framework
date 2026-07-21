# Cycle de développement

## 1. Objet

Ce document définit le cycle normal d’une modification, les gates obligatoires et la
définition de « terminé ». Il complète la charte sans l’assouplir.

## 2. Environnement officiel

La chaîne de référence est :

- Node.js 24.18.0 exact ;
- pnpm 11.4.0 ;
- installation depuis le lockfile avec `pnpm install --frozen-lockfile` ;
- navigateur(s) de validation compatibles avec la cible maintenue par le build.

Une autre version locale peut servir à explorer un problème, mais ses résultats ne suffisent
pas à valider une contribution.

## 3. Branches et commits

- `fork/main` est la branche stable et doit toujours rester publiable au regard des gates
  déjà atteints par la feuille de route.
- Une modification ordinaire utilise une branche courte : `feat/*`, `fix/*`, `refactor/*`,
  `test/*`, `docs/*` ou `chore/*`.
- Une intégration amont utilise `sync/uikit-vX.Y.Z` et suit `UPSTREAM.md`.
- Une branche ne doit pas mélanger synchronisation amont, conversion TypeScript, changement
  d’asset et redesign.

Les commits **DEVRAIENT** être atomiques et suivre les préfixes amont :
`build:`, `chore:`, `ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`, `style:` ou
`test:`.

## 4. Cycle d’une modification

### Étape 1 — Classer

Le contributeur identifie :

- le besoin vérifiable ;
- la catégorie ordinaire, sensible ou constitutionnelle ;
- les surfaces C0 à C3 concernées ;
- les sources canoniques et sorties générées touchées ;
- les licences ou versions épinglées éventuellement affectées.

Un changement constitutionnel s’arrête ici jusqu’à acceptation d’un amendement.

### Étape 2 — Établir la référence

Avant de modifier le code :

- relever `git status` ;
- exécuter ou documenter le test qui caractérise l’état actuel ;
- conserver un exemple minimal de la régression ou du comportement ;
- identifier l’équivalent dans UIkit 3.25.20 pour un changement de compatibilité.

### Étape 3 — Implémenter au bon niveau

- Modifier `src/less/` pour les styles UIkit.
- Modifier les générateurs pour les CSS Tabler ou Inter.
- Modifier le TypeScript pour le runtime déjà migré.
- Lorsqu’un fichier runtime JavaScript doit évoluer, le migrer vers TypeScript dans un
  changement comportementalement neutre avant ou séparément de l’évolution.
- Ne jamais corriger directement `src/scss/`, `dist/` ou `tests/js/test.js`.

### Étape 4 — Tester au plus près

Le test le plus petit qui reproduit le comportement est ajouté ou mis à jour. Pour un
composant interactif, il couvre selon le cas :

- création par attribut et par API ;
- ajout, retrait et reconnexion dans le DOM ;
- options initiales et mutation d’attribut ;
- souris, tactile et clavier ;
- focus, rôles, noms et états ARIA ;
- LTR et RTL ;
- réduction de mouvement ou autres préférences pertinentes ;
- destruction sans listener, observer ou nœud résiduel.

### Étape 5 — Exécuter les gates

Les gates applicables sont exécutés dans l’ordre de la section 8. Une erreur est corrigée à
sa source ; un test ou un contrôle n’est pas neutralisé pour obtenir un résultat vert.

### Étape 6 — Relire le diff

Avant livraison :

- distinguer sources et sorties générées ;
- rechercher un changement hors périmètre ;
- vérifier les bannières de licence ;
- confirmer l’absence de fichiers `.svg` Tabler et `.woff`/`.woff2` autonomes distribués ;
- exécuter un second build et vérifier l’absence de diff inexpliqué.

### Étape 7 — Documenter

Le compte rendu indique le contrat concerné, les gates exécutés, les divergences connues et
les décisions éventuellement ajoutées.

## 5. Migration TypeScript

### 5.1 Principe

La migration est incrémentale. `allowJs` permet la coexistence transitoire ; chaque fichier
migré rejoint immédiatement le contrôle strict. esbuild continue de produire les bundles,
et `tsc --noEmit` est l’autorité de type.

Le dépôt **DOIT** activer les options compatibles avec la compilation isolée par esbuild,
notamment `isolatedModules`. Les imports de types doivent être explicites.

### 5.2 Modèle de composants

Avant une conversion massive, des types centraux **DOIVENT** représenter :

- props et constructeurs de coercition ;
- data initiale ;
- computed et watchers ;
- méthodes et leur `this` ;
- hooks de cycle de vie ;
- événements, observers et updates ;
- mixins, `extends` et composants fonctionnels ;
- instance attachée au nœud DOM.

Des helpers du type `defineComponent` et `defineMixin` **DEVRAIENT** fournir le contexte
`ThisType` et composer les interfaces. Une conversion qui remplace cette modélisation par
`Record<string, any>` n’est pas conforme.

### 5.3 Ordre de migration

L’ordre recommandé est :

1. types communs et configuration ;
2. `src/js/util/`, des fonctions pures vers les utilitaires DOM ;
3. `src/js/api/` : état, options, props, cycle de vie, boot et scheduler ;
4. mixins transverses ;
5. composants core simples ;
6. groupes à état partagé :
   - modal, offcanvas, lightbox et tooltip ;
   - slider, slideshow et parallax ;
   - drop, dropdown et dropnav ;
   - sticky, sortable et upload ;
7. composants optionnels et entrées de bundle ;
8. types publics et sortie ESM additionnelle.

Les modules JavaScript et TypeScript peuvent s’importer pendant la transition. Une phase
n’est close que lorsque ses tests et son typecheck sont verts.

### 5.4 Séparation des changements

Un commit de conversion :

- conserve les exports, chemins logiques et noms publics ;
- ne change ni algorithme, ni valeur par défaut, ni CSS ;
- ne remplace pas une API dynamique par une nouvelle abstraction runtime ;
- produit un bundle dont le comportement est caractérisé contre la référence.

Les corrections découvertes pendant la conversion sont faites dans un commit séparé avec un
test d’échec.

## 6. Développement des assets

### 6.1 Tabler

`@tabler/icons` reste une dépendance de développement épinglée à 3.45.0. Le générateur :

- lit l’intégralité des 5 112 icônes Outline, `brand-*` incluses ;
- exclut les variantes filled ;
- normalise et percent-encode les tracés ;
- produit `dist/css/uikit-tabler-icons.css` ;
- génère la classe de base `.uk-ti` et les classes `.uk-ti-{nom}` ;
- conserve la bannière MIT ;
- ne copie aucun fichier SVG dans la distribution.

Un changement de tri doit produire une sortie déterministe.

### 6.2 Inter

Le générateur Inter :

- part des deux fichiers officiels 4.1 intacts, roman et italic ;
- vérifie leur empreinte ;
- les encode dans deux règles `@font-face` de `dist/css/uikit-inter.css` ;
- configure Inter comme police par défaut du framework à la source Less ;
- conserve la notice SIL OFL 1.1 ;
- ne copie aucun fichier WOFF ou WOFF2 autonome dans la distribution.

Le sous-ensemblage, la modification des contours ou le renommage sont hors cycle ordinaire.

### 6.3 Commandes

Les points d’entrée attendus sont :

    pnpm build-icons-css
    pnpm build-inter-css
    pnpm build-assets
    pnpm check-assets

La CSS générée n’est jamais éditée à la main.

## 7. Matrice de tests de compatibilité

Les pages de `tests/` constituent le catalogue historique. Elles doivent être validées au
minimum dans les modes suivants pour une release candidate :

| Axe | Cas minimaux |
| --- | --- |
| Direction | LTR et RTL |
| Entrée | souris, clavier et tactile lorsque pertinent |
| Cycle DOM | présent au chargement, ajouté, retiré, reconnecté |
| API | attribut, initialisation programmatique, destruction |
| Accessibilité | focus, nom, rôle, état, ordre clavier |
| Responsive | petit et grand viewport, resize |
| Assets | icône courante, `brand-*` Outline, roman, italic |

La comparaison visuelle ne remplace pas les assertions de comportement et d’accessibilité.

## 8. Gates

| Gate | Commande ou preuve | Bloquant pour |
| --- | --- | --- |
| G0 — Périmètre | `git status` et diff relu | toute contribution |
| G1 — Dépendances | `pnpm install --frozen-lockfile` sous Node.js 24.18.0 | build et release |
| G2 — Lint | `pnpm exec eslint .` | code et scripts |
| G3 — Types | `pnpm exec tsc --noEmit` | runtime TypeScript |
| G4 — Build | `pnpm compile` | code, styles et release |
| G5 — RTL | `pnpm compile-rtl` | styles, composants et release |
| G6 — Assets | `pnpm build-assets` puis `pnpm check-assets` | assets, packaging et release |
| G7 — Compatibilité | tests ciblés puis catalogue `tests/` LTR/RTL | runtime et release |
| G8 — Légal | versions, empreintes et notices contrôlées | assets et release |
| G9 — Reproductibilité | second build puis `git diff --exit-code` | release |

Un changement documentaire seul exécute G0 et une revue de cohérence. Il n’a pas à
régénérer les artefacts s’il ne modifie aucune règle consommée par un générateur.

## 9. Définition de terminé

Une modification est terminée lorsque :

- son besoin et son périmètre sont explicites ;
- sa source canonique, et non sa sortie, a été modifiée ;
- elle possède les tests proportionnés au risque ;
- tous les gates applicables sont verts ;
- les sorties sont déterministes ;
- la compatibilité est préservée ou la divergence est acceptée et documentée ;
- les licences sont intactes ;
- aucun commentaire `TODO` non suivi ni contournement de type n’est ajouté ;
- le compte rendu permet à une autre personne de reproduire la validation.

## 10. Préparation d’une release

Une release candidate exige en plus :

1. checkout propre depuis `fork/main` ;
2. installation gelée sous la chaîne officielle ;
3. suite complète des gates G1 à G9 ;
4. validation du catalogue historique LTR et RTL ;
5. inventaire de `dist/` sans `*.svg` Tabler, `*.woff` ni `*.woff2` ;
6. vérification des 5 112 icônes Outline et des deux faces Inter ;
7. notes de migration pour toute divergence ;
8. version propre au fork, distincte du tag amont ;
9. tag annoté et immuable après acceptation.
