# Changelog

Journal des changements de Drake.css framework. L'historique du projet amont est archivé
dans [`docs/fork/CHANGELOG-uikit-amont.md`](docs/fork/CHANGELOG-uikit-amont.md).

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
- Distribution par GitHub (D-020, amendant D-018) : release `v0.1.0` avec tarball
  `drake.css-0.1.0.tgz` attaché, installation `npm install github:…#v0.1.0`, CDN
  jsDelivr au tag ; le registre npm reste optionnel et non bloquant.
- Remote `origin` : dépôt GitHub `Test-bot-cell/Drake-css-framework`, public depuis
  D-019, CI `verify` rejouant la chaîne complète de preuves à chaque push.

### Hérité

- Runtime navigateur intégralement TypeScript strict, sans source JavaScript frontend.
- Tabler Icons 3.45.0 Outline en masques CSS (5 112 icônes), catalogue opt-in.
- Inter 4.1 variable roman et italic embarquée en CSS, zéro fichier de fonte autonome.
- Contrat HTML-first, mobile-first 320 px et SEO technique avec gates G0–G14.
