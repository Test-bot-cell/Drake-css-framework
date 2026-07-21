# Registre des exceptions héritées (cibles < 24 px)

Créé par D-017, **vidé par D-021** (2026-07-21). Les treize familles qui y étaient
consignées (checkbox, radio, range, file-input, dotnav, thumbnav, pagination, subnav,
iconnav, badge-lien, button-text et les deux fixtures de gates) ont reçu une zone de
saisie >= 24 px CSS conforme WCAG 2.5.8, par les techniques normées dans la décision
D-021 (`docs/fork/DECISIONS.md`) : zone de saisie compensée (padding, `background-clip`,
marges négatives), anneaux convertis `border` → `box-shadow` inset, ou planchers
`min-width`/`min-height` quand la croissance de boîte était acceptée.

Le registre machine `tests/fixtures/heritage-exceptions.json` est conservé **vide** en
garde-fou : `pnpm audit-heritage` mesure les 88 pages du catalogue à 320 px et échoue si
une cible < 24 px apparaît sans y être consignée. L'état normal est zéro cible, zéro
règle.

Procédure si une nouvelle exception devait naître (import amont, nouveau composant) :

1. une décision au registre `DECISIONS.md` la justifie (jamais un silence de l'audit) ;
2. une règle machine (`family`, `selector`, `reason`, `pages` éventuel) est ajoutée à
   `tests/fixtures/heritage-exceptions.json` ;
3. ce document la documente avec sa taille mesurée et son emplacement dans le catalogue.

Historique : l'inventaire d'origine (13 familles, tailles 3-22 px) est lisible dans ce
fichier au tag `v0.1.0`.
