// Test de consommation ESM (D-025) : prouve que les types se résolvent PAR LA CARTE
// exports de package.json, sans le mapping paths du cas historique (tsconfig.json).
// Sous moduleResolution Bundler, l'import du nom du paquet depuis l'intérieur du dépôt
// passe par l'auto-référence Node (champ exports) : « drake.css » atteint la condition
// types de « . » (dist/types/drake.d.ts) et « drake.css/core » celle de « ./core »
// (dist/types/drake-core.d.ts) — exactement le chemin d'un intégrateur Vite/esbuild.
import type Drake from 'drake.css';
import type { DrakePlugin, DrakeStatic } from 'drake.css';
import type DrakeCore from 'drake.css/core';

type AssertTrue<Condition extends true> = Condition;

// Les entrées « . » et « ./core » livrent le même objet statique typé DrakeStatic.
type EntryExposesStatic = AssertTrue<typeof Drake extends DrakeStatic ? true : false>;
type CoreExposesStatic = AssertTrue<typeof DrakeCore extends DrakeStatic ? true : false>;

// Les types publics restent réexportés par l'entrée résolue via la carte exports.
type PluginAcceptsApp = AssertTrue<
    DrakePlugin extends (app: DrakeStatic) => unknown ? true : false
>;
type VersionIsString = AssertTrue<DrakeStatic['version'] extends string ? true : false>;

export type { CoreExposesStatic, EntryExposesStatic, PluginAcceptsApp, VersionIsString };
