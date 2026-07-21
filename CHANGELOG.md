# Changelog

Journal des changements de Drake.css framework. L'historique du projet amont est archivé
dans [`docs/fork/CHANGELOG-uikit-amont.md`](docs/fork/CHANGELOG-uikit-amont.md).

## 0.1.0 (non publié)

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

### Hérité

- Runtime navigateur intégralement TypeScript strict, sans source JavaScript frontend.
- Tabler Icons 3.45.0 Outline en masques CSS (5 112 icônes), catalogue opt-in.
- Inter 4.1 variable roman et italic embarquée en CSS, zéro fichier de fonte autonome.
- Contrat HTML-first, mobile-first 320 px et SEO technique avec gates G0–G14.
