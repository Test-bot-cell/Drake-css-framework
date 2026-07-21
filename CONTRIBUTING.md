# Contribuer à Drake.css framework

Drake.css framework (forme courte : Drake.css) est un fork de maintenance privé du projet
amont (voir [FORK.md](FORK.md)). Une contribution à ce dépôt suit d’abord la charte et les
décisions locales ; elle **NE DOIT PAS** être présentée comme une release du projet amont ni
publiée sous son identité.

## Avant de modifier

Lire, dans cet ordre :

1. [`docs/fork/CHARTER.md`](docs/fork/CHARTER.md) ;
2. [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) ;
3. [AGENTS.md](AGENTS.md) ;
4. les documents spécialisés sous `docs/fork/`.

Le cycle complet, les sources canoniques et les gates bloquants (G0–G14) sont définis dans
[`docs/fork/DEVELOPMENT.md`](docs/fork/DEVELOPMENT.md). Le contrat de compatibilité est la
parité comportementale C0–C3 avec la référence interne définie par D-012 ; une
incompatibilité volontaire exige une décision et une migration avant son implémentation.

## Branches

`fork/main` est la branche stable locale. Une modification part d’une branche courte
`feat/*`, `fix/*`, `refactor/*`, `test/*`, `docs/*` ou `chore/*`. Une synchronisation avec le
projet amont utilise exclusivement une branche `sync/*`, nommée et conduite selon
[`docs/fork/UPSTREAM.md`](docs/fork/UPSTREAM.md).

Il est interdit de pousser vers le remote `upstream`, de déplacer un tag amont ou de
réintroduire temporairement une source JavaScript navigateur.

## Validation

La chaîne de référence est Node.js 24.18.0 exact avec pnpm 11.4.0 :

```sh
pnpm install --frozen-lockfile
pnpm verify
```

Une contribution modifie la source canonique définie par
[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) — pour les styles, `src/less` reste
canonique et `src/scss` généré tant que le port vers Panda.css (D-013) n’est pas achevé avec
preuve de parité —, régénère les sorties concernées sous `dist/`, puis relit le diff. Lint,
typecheck strict, builds LTR/RTL, assets, HTML sans runtime, reflow 320 px, SEO, performance
et compatibilité des icônes `.drk-ti-*` sont bloquants selon le périmètre. La CSS distribuée
**DOIT** rester statique, générée et déterministe : deux générations successives produisent
des fichiers identiques. Un test neutralisé ou une sortie générée corrigée à la main n’est
jamais une solution.

## Commits

Les commits restent atomiques et utilisent les préfixes historiques : `build:`, `chore:`,
`ci:`, `docs:`, `feat:`, `fix:`, `perf:`, `refactor:`, `style:` ou `test:`. Une conversion
TypeScript, une correction comportementale, un port de styles vers Panda.css et une
régénération doivent rester distinguables dans l’historique.

## Questions relevant du projet amont

Tout ce qui concerne le projet amont — identité, provenance, remontée éventuelle d’un défaut
qui ne dépend pas du fork, synchronisation — relève de [FORK.md](FORK.md) et de
[`docs/fork/UPSTREAM.md`](docs/fork/UPSTREAM.md). Ce document ne décrit aucune procédure de
contribution au projet amont ; la provenance de tout correctif porté ici doit rester
explicite.

## Licence

Les contributions au code du fork sont fournies sous licence MIT, sauf mention applicable à
un asset tiers. Les mentions de copyright du projet amont (voir [LICENSE.md](LICENSE.md) et
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)), la licence MIT de Tabler Icons et la
SIL OFL 1.1 d’Inter **DOIVENT** être conservées.
