# Contribuer à UIkit TS

UIkit TS est un fork de maintenance privé. Une contribution à ce dépôt suit d’abord la
charte et les décisions locales ; elle ne doit jamais être proposée comme une release
officielle UIkit sous l’identité de YOOtheme.

## Avant de modifier

Lire, dans cet ordre :

1. [`docs/fork/CHARTER.md`](docs/fork/CHARTER.md) ;
2. [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) ;
3. [AGENTS.md](AGENTS.md) ;
4. les documents spécialisés sous `docs/fork/`.

Le cycle complet, les sources canoniques et les gates bloquants sont définis dans
[`docs/fork/DEVELOPMENT.md`](docs/fork/DEVELOPMENT.md). Une incompatibilité volontaire exige
une décision et une migration avant son implémentation.

## Branches

`fork/main` est la branche stable locale. Une modification part d’une branche courte
`feat/*`, `fix/*`, `refactor/*`, `test/*`, `docs/*` ou `chore/*`. Une synchronisation amont
utilise exclusivement `sync/uikit-vX.Y.Z` et suit
[`docs/fork/UPSTREAM.md`](docs/fork/UPSTREAM.md).

Il est interdit de pousser vers le remote `upstream`, de déplacer un tag amont ou de
réintroduire temporairement une source JavaScript navigateur.

## Validation

La chaîne de référence est Node.js 24.18.0 avec pnpm 11.4.0 :

```sh
pnpm install --frozen-lockfile
pnpm verify
```

Une contribution modifie la source canonique, régénère `src/scss/` et `dist/`, puis relit le
diff. Lint, typecheck strict, builds LTR/RTL, assets, HTML sans runtime, reflow 320 px, SEO,
performance et compatibilité d’icônes sont bloquants selon le périmètre. Un test neutralisé
ou une sortie générée corrigée à la main n’est jamais une solution.

## Commits

Les commits restent atomiques et utilisent les préfixes historiques : `build:`, `chore:`,
`ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`, `style:` ou `test:`. Une conversion
TypeScript, une correction comportementale et une régénération doivent rester distinguables
dans l’historique.

## Problèmes propres à UIkit amont

Un défaut reproductible qui ne dépend pas de TypeScript, Tabler, Inter ou des règles
HTML/mobile/SEO du fork peut être proposé séparément au
[projet UIkit officiel](https://github.com/uikit/uikit), en respectant ses propres règles. La
provenance de tout correctif ensuite porté ici doit rester explicite.

## Licence

Les contributions au code du fork sont fournies sous licence MIT, sauf mention applicable à
un asset tiers. Les mentions UIkit, la licence MIT de Tabler Icons et la SIL OFL 1.1 d’Inter
doivent être conservées.
