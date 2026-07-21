# Registre des décisions

## Usage

Ce registre contient les décisions structurantes du fork. Une décision **acceptée** est
normative. Elle reste applicable jusqu’à son remplacement par une nouvelle décision issue de
la procédure d’amendement de `CHARTER.md`.

Statuts possibles :

- **Proposée** : discussion ouverte, non applicable ;
- **Acceptée** : applicable ;
- **Remplacée** : conservée pour l’historique, remplacée par une autre décision ;
- **Rejetée** : examinée mais non retenue.

Une décision n’est pas modifiée pour effacer son historique. Un changement de sens ajoute une
nouvelle entrée et marque l’ancienne comme remplacée.

## D-001 — Base UIkit immuable

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Le fork part de UIkit `v3.25.20` au commit
`45cc430052ba967de8e9972507dee4d37701552d`.

Le tag amont étant léger et non signé, le fork enregistre le SHA et crée un tag local annoté
`fork-base/uikit-v3.25.20`. `upstream` reste le dépôt officiel en lecture seule.

### Conséquences

- La provenance est vérifiable.
- Une future mise à jour suit `UPSTREAM.md`.
- Le tag amont ne peut pas nommer une release modifiée du fork.

## D-002 — TypeScript pour le runtime navigateur

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

TypeScript strict est le langage source cible du runtime. La migration est progressive avec
coexistence temporaire des fichiers JavaScript historiques.

esbuild produit le JavaScript de distribution ; `tsc --noEmit` contrôle les types. Les
scripts de build Node.js peuvent rester en JavaScript.

### Raisons

- Préserver le comportement JavaScript et le contrat UIkit.
- Migrer par petites unités vérifiables.
- Ajouter des types publics sans imposer un nouveau runtime.

### Conséquences

- Le JavaScript dans `dist/js/` est attendu.
- Une conversion ne doit pas contenir de redesign.
- Les abstractions dynamiques UIkit doivent recevoir une modélisation typée centrale.

## D-003 — Elm réservé à un adaptateur futur

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Elm n’entre ni dans le cœur, ni dans la chaîne obligatoire, ni dans le contrat du runtime.

Après stabilisation, un adaptateur Elm peut être proposé comme paquet séparé consommant les
API publiques et le CSS du fork.

### Raisons

Une réécriture Elm changerait le modèle de possession du DOM et exigerait une glue JavaScript
importante pour les observers, mesures, plugins et API impératives. Elle ne préserverait pas
le fork comme progressive enhancement compatible UIkit.

### Conséquences

- Aucun port Elm dans le cœur.
- Aucun composant ne dépend d’une application Elm pour fonctionner.
- Le jalon Elm reste non bloquant et postérieur à la première release stable.

## D-004 — Compatibilité avant modernisation

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Les attributs `uk-*`/`data-uk-*`, classes, événements, cycle DOM, accessibilité, RTL et API
publique de UIkit 3.25.20 sont protégés.

Une sortie ESM ou une API plus typée peut être ajoutée, mais les bundles et usages historiques
ne sont supprimés qu’après une décision de rupture et un plan de migration.

### Conséquences

- Les tests couvrent les niveaux C0 à C3 applicables.
- Toute divergence intentionnelle est documentée.
- La conversion TypeScript ne sert pas de prétexte à une nouvelle architecture runtime.

## D-005 — Tabler Icons Outline 3.45.0 en CSS

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Le catalogue officiel contient exactement les 5 112 icônes Outline de
`@tabler/icons@3.45.0`, y compris les `brand-*` qui appartiennent à ce catalogue. Les
variantes filled sont exclues.

Le générateur produit `dist/css/uikit-tabler-icons.css` avec `mask` et
`-webkit-mask`. Les tracés SVG sont percent-encodés dans des `data:image/svg+xml`.
La classe de base est `.uk-ti` et chaque entrée utilise `.uk-ti-{nom}`.

Aucun fichier ou asset Tabler `.svg` autonome n’est distribué.

### Raisons

- Catalogue cohérent et épinglé.
- Coloration par `currentColor` et usage CSS.
- Distribution monofichier sans requêtes d’icônes.

### Conséquences

- La CSS contient des données SVG ; « sans SVG distribué » signifie sans fichier autonome.
- La CSP cliente doit permettre `img-src data:`.
- Le nombre de classes, la version, les empreintes et l’absence de fichiers SVG sont des
  gates automatiques.
- La licence MIT de Tabler est conservée dans les sorties ou notices.

## D-006 — Inter 4.1 variable roman et italic en CSS

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Inter 4.1 officielle devient la police du framework. Les faces variables roman et italic
intactes sont encodées en WOFF2 `data:` URI dans `dist/css/uikit-inter.css`.

Aucun fichier `.woff` ou `.woff2` autonome n’est distribué.

### Raisons

- Une famille variable cohérente pour le roman et l’italique.
- Une CSS autonome, sans chargement réseau.
- Pas de duplication de fichiers de fontes dans la distribution.

### Conséquences

- La CSS contient des octets WOFF2 ; l’interdiction vise les fichiers autonomes.
- La CSP cliente doit permettre `font-src data:`.
- Les deux faces et leurs empreintes sont contrôlées.
- La SIL OFL 1.1 et le nom réservé « Inter » sont respectés.
- Aucun subset ou dérivé ne peut conserver le nom Inter.

## D-007 — Sources de styles et artefacts générés

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

`src/less/` est la source canonique des styles. `src/scss/`, `dist/` et
`tests/js/test.js` sont générés.

Les CSS Tabler et Inter sont elles aussi générées depuis des entrées épinglées. Une correction
manuelle d’une sortie est interdite.

### Conséquences

- Toute correction est faite dans la source ou le générateur.
- Un second build ne doit produire aucun diff.
- Les conflits amont dans les sorties sont résolus en régénérant.

## D-008 — Chaîne reproductible épinglée

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

La chaîne officielle utilise Node.js 24.18.0, pnpm 11.4.0 et le lockfile gelé. Une release
exécute lint, typecheck, build normal, build RTL, contrôles d’assets, tests de compatibilité et
contrôle de reproductibilité.

### Conséquences

- Une validation sous une autre version n’est qu’indicative.
- esbuild seul ne constitue pas un typecheck.
- Un artefact non déterministe bloque la release.

## D-009 — Licences et notices préservées

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Le fork conserve :

- UIkit sous MIT avec ses mentions amont ;
- Tabler Icons 3.45.0 sous MIT ;
- Inter 4.1 sous SIL Open Font License 1.1.

Les bannières essentielles survivent à la minification. La provenance et la version de chaque
asset sont vérifiables depuis le build et le lockfile.

### Conséquences

- Une sortie sans licence applicable est non publiable.
- Une mise à jour tierce nécessite revue de licence et décision de version.
- Modifier Inter ou en produire un sous-ensemble exige un nouveau nom et un amendement.

## D-010 — Amendements explicites

- Date : 2026-07-21
- Statut : **Acceptée**

### Décision

Les versions sanctuarisées, le langage du cœur, le contrat de compatibilité, les formats
d’assets, les licences et les gates de release ne changent pas implicitement.

Toute modification passe par :

1. une proposition documentaire ;
2. une analyse des alternatives et impacts ;
3. l’acceptation explicite du mainteneur ;
4. une nouvelle décision ;
5. l’implémentation seulement après ou dans un commit ultérieur clairement séparé.

### Conséquences

- Un changement de code contradictoire avec la charte reste non conforme même s’il compile.
- Ce registre conserve l’historique des décisions remplacées.

## Modèle d’une nouvelle décision

    ## D-NNN — Titre

    - Date : AAAA-MM-JJ
    - Statut : Proposée | Acceptée | Remplacée | Rejetée
    - Remplace : D-NNN, le cas échéant

    ### Contexte

    Problème vérifiable et contraintes.

    ### Options

    Alternatives examinées.

    ### Décision

    Règle retenue.

    ### Conséquences

    Compatibilité, migration, risques, licences et nouveaux gates.
