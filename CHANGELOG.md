# Changelog

Journal des changements de Drake.css framework. L'historique du projet amont est archivé
dans [`docs/fork/CHANGELOG-uikit-amont.md`](docs/fork/CHANGELOG-uikit-amont.md).

## Non publié

### Ajouté

- Pilote de synchronisation amont à blanc (décision D-023) : la procédure
  `docs/fork/UPSTREAM.md` exercée sur le delta historique v3.25.16 → v3.25.20 avec
  vérité terrain — 44 hunks substantiels vérifiés, 32 retrouvés preuve à l'appui,
  12 sans objet par décision, zéro absent ; outillage `build/fork/sync-scout.js` et
  rapport en section 11 d'`UPSTREAM.md`.
- Trio de fiabilité de distribution (décision D-024) : gate consommateur en CI (le
  tarball est installé dans un projet vierge et fumé à chaque push), rituel de
  release outillé `pnpm release` (préflight, tag signé, release GitHub, vérification
  HTTP des chemins CDN), budgets de taille épinglés des artefacts principaux dans
  `pnpm verify` (relèvement = décision consignée, jamais silencieux).

## 0.1.1 — 2026-07-21

### Ajouté

- Cibles tactiles >= 24 px CSS (décision D-021) : les onze familles de composants du
  registre d'exceptions et les deux pages fixtures reçoivent une zone de saisie
  conforme WCAG 2.5.8 — huit familles à identité visuelle stricte (padding compensé,
  `background-clip`, anneaux convertis en `box-shadow`), trois à croissance de boîte
  mineure sans peinture nouvelle. Le registre d'exceptions est vidé ;
  `pnpm audit-heritage` devient le gate de non-régression tactile (zéro cible).
- Variante de fontes en fichiers (décision D-022, amendant D-006/D-009) : quatre WOFF2
  Inter subsettés latin/latin-ext à axes variables (103-145 Kio) et feuille
  `drake-inter-files.css` à `unicode-range` (2,9 Ko gzip contre 731 Ko pour l'option
  mono-fichier conservée) — chargement recommandé ; empreintes épinglées, génération
  déterministe prouvée.
- Feuilles d'icônes réduites : option `--subset`/`--subset-output` du générateur Tabler
  (3 icônes = 3,8 Ko contre 3,9 Mo de catalogue opt-in) ; coût de parse et limite
  monochrome documentés.
- Garde d'intégrité de distribution (G8) : tout fichier empaqueté par npm doit être
  suivi par git — un artefact généré non versionné est inlivrable par les canaux git.
- Section README « Comment c'est testé » cartographiant la chaîne de preuve CI.

### Changé

- Le dépôt est public (décision D-019) et la distribution est GitHub-first (décision
  D-020) : release avec tarball npm attaché, installation `github:…#tag`, CDN jsDelivr ;
  le registre npm reste optionnel. CI `verify` requise par la protection de branche.

### Corrigé

- Trente-deux artefacts empaquetés n'étaient pas versionnés (`drake-inter-files.css`,
  `drake-core*.css`, bundles de composants) : présents dans le tarball de release mais
  absents des installs git et du CDN. Tous suivis désormais, couverts par G9 et par la
  nouvelle garde G8.

## 0.1.0 — 2026-07-21

### Changé

- Le fork adopte l'identité **Drake.css framework** (décision D-012) : API globale `Drake`,
  préfixe universel `drk-` (classes, attributs, propriétés personnalisées), icônes `.drk-ti`,
  artefacts `dist/css/drake*.css` et `dist/js/drake*.js`, paquet privé `drake.css` en version
  `0.1.0`.
- Le contrat de compatibilité devient la parité comportementale C0–C3 avec la référence
  interne pré-renommage (D-012) ; le registre des surfaces héritées est documenté dans
  `FORK.md`.
- Les styles ont intégralement quitté Less/SCSS pour Panda.css (décision D-013, port
  achevé) : `panda.config.ts` + `src/styles/` (tokens, fragments `globalCss` ordonnés)
  sont la source canonique, la parité avec la référence Less est prouvée par diff CSS
  normalisé sur les quatre artefacts (`tests/fixtures/panda-parity-proof.json`) et
  `src/less/`, `src/scss/` ainsi que les mixins sont supprimés.
- Elm demeure hors du cœur après réexamen (décision D-014).

### Ajouté

- Gate G7 outillé (`pnpm check-compat`) : matrice de compatibilité C0-C3 contre la
  référence pré-renommage — 176 snapshots structurels du catalogue (LTR/RTL), scénarios
  d'interaction des grappes prioritaires, boucle API programmatique avec destruction
  vérifiée ; fixtures sous `tests/fixtures/compat/`.
- Les fragments de `src/styles/` consomment les tokens (`palette`, `breakpoints`,
  `fontFamilies`) à la génération, à sortie CSS strictement identique (preuve par
  empreintes et diff de parité G15).
- Phase 1 close : attentes sans runtime par composant (`docs/fork/NO_RUNTIME.md` +
  fixtures machine vérifiées par G7) et inventaire de la dette mobile-first/SEO héritée
  (`pnpm audit-heritage`, 88 pages à 320 px).
- Theming par propriétés personnalisées (décision D-016, acceptée puis implémentée) :
  `:root` publie les 12 tokens sémantiques en `--drk-*`, la cascade consomme
  `var(--drk-…, <valeur héritée>)` — surcharge sans reconstruction, chemin mode sombre
  documenté dans `FORK.md` ; équivalence calculée prouvée par les gates navigateur.
- Cap de stabilisation 0.1.0 (décision D-017) : versionnage SemVer avec tags annotés
  signés `v0.1.0-rc.N`, remote `origin` décidé (dépôt GitHub privé, création et push au
  feu vert explicite), `private: true` conservé jusqu'à une décision de publication npm,
  pas de sortie ESM en 0.1.0.
- Déclarations TypeScript consommateur : `dist/types/` émis et committé (entrée `types`
  de `package.json`, global UMD `window.Drake` déclaré), test de consommation strict
  dans `pnpm typecheck` (G3).
- Audit d'identité D-012 automatisé dans G10 : zéro occurrence du préfixe hérité et des
  noms amont hors zones autorisées (allowlist committée et justifiée, bannières légales
  décomptées, entrées périmées refusées).
- Scénarios C2 de cycle de vie (reconnexion DOM, montage/destruction par attribut,
  `$reset` sur mutation de valeur, composant custom et plugin `use()`), portant la
  matrice à 156 assertions.
- Dette héritée du catalogue résorbée (D-017) : zéro débordement horizontal à 320 px sur
  les 88 pages, dimensions réservées et alternatives sur toutes les images, hiérarchie
  de titres séquentielle, vidéos de démonstration servies localement
  (`tests/media/drake-demo.webm`) — le catalogue n'exige plus le réseau. Les cibles
  < 24 px inhérentes aux composants hérités sont intégralement consignées au registre
  d'exceptions (`docs/fork/HERITAGE_EXCEPTIONS.md`, contrôle automatique : zéro cible
  non consignée) ; snapshots C0/C1 et attentes sans-runtime recapturés sur cette
  divergence décidée, scénarios C2 et boucle C3 verts sans recapture.
- Notes de migration `docs/fork/MIGRATION.md` : table normative de renommage des
  préfixes et de l'API globale, correspondance des artefacts, migration des icônes et du
  theming.

### Mesures (2026-07-21, chaîne officielle Node.js 24.18.0 / pnpm 11.4.0)

- Tailles : `drake.min.css` 305 Kio, `drake-core.min.css` 290 Kio, `drake.min.js`
  166 Kio, `drake-inter.css` 969 Kio (fontes embarquées), `drake-tabler-icons.css`
  3,8 Mio (catalogue opt-in) ; empreintes dans `dist/fork-manifest.json`.
- Laboratoire (fixture G13, Chrome headless) : LCP 116 ms mobile / 108 ms bureau,
  INP 16 ms, CLS 0, TBT 0 ; reflow 320 px sans défilement horizontal.
- Fuites : boucle C3 — 58 composants montés puis détruits sans listener, observer ni
  nœud résiduel ; scénarios de reconnexion sans résidu.
- Initialisation (médiane de 3 runs, catalogue local) : `index.html` 106 instances
  montées, `domInteractive` 71 ms, `load` 159 ms ; `form.html` 36 instances, 40/138 ms ;
  `slider.html` 39 instances, 43/145 ms.
- Reconstruction en environnement propre : clone frais + `pnpm install
  --frozen-lockfile` + `pnpm verify` verts, zéro diff des artefacts suivis après
  reconstruction.

### Release

- Release candidate : tag annoté signé `v0.1.0-rc.1` (2026-07-21), distinct des tags
  amont (D-017).
- Acceptation finale du mainteneur le 2026-07-21, gates re-prouvés verts sur checkout
  propre : tag annoté signé `v0.1.0`.
- Remote `origin` : dépôt GitHub `Test-bot-cell/Drake-css-framework` (release `v0.1.0`
  avec tarball attaché).

### Hérité

- Runtime navigateur intégralement TypeScript strict, sans source JavaScript frontend.
- Tabler Icons 3.45.0 Outline en masques CSS (5 112 icônes), catalogue opt-in.
- Inter 4.1 variable roman et italic embarquée en CSS, zéro fichier de fonte autonome.
- Contrat HTML-first, mobile-first 320 px et SEO technique avec gates G0–G14.
