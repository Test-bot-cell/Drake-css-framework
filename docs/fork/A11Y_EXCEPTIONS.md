# Registre des exceptions d'accessibilité (axe-core)

Créé par **D-026** (2026-07-22, `docs/fork/DECISIONS.md`). La campagne d'accessibilité a
inventorié 3 926 violations axe-core 4.10.3 en 15 familles sur les 88 pages du catalogue
(viewport 320×640, runtime actif) et les a résorbées par correction réelle — palette de
rôles texte AA, sémantique du catalogue, réparations sans changement visuel, soulignement
des liens — à l'exception des **surfaces d'accent de l'axe 1**, préservées par décision :
boutons, badges, labels et contextes inverse gardent leur blanc sur couleur d'accent
héritée de l'amont. Ces ~193 occurrences (familles D « blanc-sur-accent », 88 occ, et
E « inverse-sur-primary », 105 occ, de l'analyse `color-contrast`) sont consignées ici et
dans le registre machine `tests/fixtures/a11y-exceptions.json`.

Le gate `pnpm audit-a11y` (`build/fork/audit-a11y.js`) rejoue axe-core exact-épinglé sur
les 88 pages et échoue si une violation apparaît sans être consignée, ou si une règle du
registre ne consigne plus rien (entrée périmée). Inventaire committé :
`tests/fixtures/a11y-audit.json`.

## Exceptions consignées (règle axe `color-contrast`)

Ratios mesurés par axe-core 4.10.3 sur le catalogue (l'analyse D-026 recalcule 3,46 pour
le danger, 1,95 pour le success et 2,54 pour le composé 0,7 — écarts d'arrondi).

| Famille                  | Sélecteur                                                                                                                                                                                                                                         | Paire mesurée                                                                                                                            | Emplacement dans le catalogue                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `D-boutons-accent`       | `.drk-button-primary, .drk-button-danger`                                                                                                                                                                                                         | `#fff` sur primary `#1e87f0` = **3,63:1** ; sur danger `#f0506e` = **3,45:1**                                                            | button, card, table, section, icon, index, offcanvas, upload, filter, form, fork-mobile-seo                     |
| `D-badges`               | `.drk-badge, .drk-card-badge`                                                                                                                                                                                                                     | `#fff` sur primary `#1e87f0` = **3,63:1** (corps 11 px)                                                                                  | badge, card                                                                                                     |
| `D-labels`               | `.drk-label`                                                                                                                                                                                                                                      | `#fff` sur primary = **3,63:1**, success `#32d296` = **1,94:1**, warning `#faa05a` = **2,05:1**, danger = **3,45:1**                     | label, index, form                                                                                              |
| `D-subnav-pill-actif`    | `.drk-subnav-pill .drk-active a`                                                                                                                                                                                                                  | pilule active : `#fff` sur primary `#1e87f0` = **3,63:1**                                                                                | subnav, filter, switcher, utility, index                                                                        |
| `D-panneaux-demo-filter` | `li[color="green"] > .drk-panel` (page `filter.html`)                                                                                                                                                                                             | `#fff` sur success `#32d296` = **1,94:1**                                                                                                | filter                                                                                                          |
| `E-inverse-sur-primary`  | contextes `.drk-section-primary`, `.drk-card-primary`, `.drk-tile-primary`, `.drk-background-primary.drk-light` et leurs descendants, hors cartes non primary imbriquées (`:not(:is(.drk-card-default, .drk-card-secondary, .drk-card-muted) *)`) | `rgba(255,255,255,0.7)` composé `#bcdbfb` = **2,53:1** ; `rgba(255,255,255,0.5)` composé `#8fc3f8` = **1,96:1** ; blanc pur = **3,63:1** | card, sticky, section, tile, height-viewport, sticky-navbar, sticky-parallax, scrollspy, index, fork-mobile-seo |

La famille E est **mathématiquement insoluble à palette constante** : sur le fond primary
`#1e87f0`, même le blanc pur ne fait que 3,63:1 < 4,5:1 requis (SC 1.4.3). L'assombrir
exigerait `primary ≤ #0f76de`, `danger ≤ #ea143c`, `success ≤ #1e865f`,
`warning ≤ #c15806` et un alpha inverse ≥ 0,92 — rupture d'identité écartée par
l'arbitrage D-026 ; les rôles **texte** de ces couleurs, eux, sont passés AA à la racine
(`tokens.ts`).

## Procédure d'ajout d'une exception

Toute nouvelle exception naît d'une décision, **jamais d'un silence de l'audit** :

1. une décision au registre `DECISIONS.md` la justifie (import amont, nouveau composant,
   arbitrage esthétique) ;
2. une règle machine (`famille`, `regle` axe, `selecteur`, `motif`, `pages` éventuel) est
   ajoutée à `tests/fixtures/a11y-exceptions.json` — le sélecteur est apparié via
   `element.matches` sur le nœud en violation, à défaut par égalité avec la cible axe ;
3. ce document la documente avec ses ratios (ou son critère) mesurés et son emplacement
   dans le catalogue.

Une règle qui ne consigne plus rien (composant corrigé ou disparu) fait échouer le gate :
elle se retire ici et dans le registre machine, avec la décision correspondante.
