# Registre des exceptions héritées (cibles < 24 px)

Créé par D-017. La résorption de la dette héritée du catalogue est intégrale côté markup
(débordements à 320 px, dimensions réservées, alternatives, hiérarchie de titres : zéro
écart). Restent les cibles interactives < 24 px CSS (WCAG 2.5.8, hors liens en ligne)
dont la taille est définie par la CSS des composants hérités : D-017 interdit de modifier
cette CSS (le contrat de parité C0-C3 avec la référence pré-renommage n'est pas amendé),
chaque résidu est donc consigné ici, avec sa contrepartie machine
`tests/fixtures/heritage-exceptions.json` que `pnpm audit-heritage` applique — le nombre
de cibles NON consignées doit rester zéro.

Chaque famille reste à trancher composant par composant par une décision ultérieure
(agrandir la cible dans la CSS du fork = divergence assumée ; ou statu quo documenté).

| Famille           | Sélecteur              | Taille typique | Où (catalogue)                   |
| ----------------- | ---------------------- | -------------- | -------------------------------- |
| checkbox          | `input.drk-checkbox`   | 14-22 px       | form, table, utility, index      |
| radio             | `input.drk-radio`      | 14-22 px       | form, index                      |
| range             | `input.drk-range`      | piste 3 px     | form, index                      |
| file-input        | `input[type="file"]`   | 21 px          | form                             |
| dotnav            | `.drk-dotnav a`        | 10×10 px       | dotnav, slider, slideshow, index |
| thumbnav          | `.drk-thumbnav a`      | variable       | thumbnav                         |
| pagination        | `.drk-pagination a`    | 27×22 px       | pagination, index                |
| subnav            | `.drk-subnav a`        | 20 px          | comment                          |
| iconnav           | `.drk-iconnav a`       | 20 px          | iconnav, index                   |
| badge (lien)      | `a.drk-badge`          | 18 px          | badge, index                     |
| button-text       | `.drk-button-text`     | 21 px          | button                           |
| fixtures de gates | liens/boutons de liste | 21 px          | fork-mobile-seo, fork-assets     |

Notes :

- les cases à cocher et boutons radio héritent des tailles de l'amont ; l'enveloppe
  `<label>` agrandit la zone cliquable effective mais pas la boîte du contrôle mesurée ;
- les points de dotnav (10 px) sont la famille la plus éloignée du seuil : candidate
  prioritaire à une décision d'agrandissement dans le fork ;
- le chrome du harnais de test (case RTL) a été porté à 24 px : il ne figure plus ici ;
- toute nouvelle exception passe par ce registre et sa contrepartie machine, jamais par
  un silence de l'audit.
