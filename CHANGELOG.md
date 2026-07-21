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
- Les styles quittent Less/SCSS pour Panda.css (décision D-013) ; transition composant par
  composant avec preuve de parité, `src/less/` restant canonique jusqu'à l'achèvement du
  port.
- Elm demeure hors du cœur après réexamen (décision D-014).

### Hérité

- Runtime navigateur intégralement TypeScript strict, sans source JavaScript frontend.
- Tabler Icons 3.45.0 Outline en masques CSS (5 112 icônes), catalogue opt-in.
- Inter 4.1 variable roman et italic embarquée en CSS, zéro fichier de fonte autonome.
- Contrat HTML-first, mobile-first 320 px et SEO technique avec gates G0–G14.
