// Publication des tokens sémantiques en propriétés personnalisées (D-016).
// Ce fragment ouvre la cascade : une intégration rethème en redéfinissant ces
// propriétés (aucun réseau, aucune reconstruction) ; les fragments consomment
// var(--drk-…, <valeur héritée>) et restent donc équivalents sans surcharge.
import type { GlobalStyleObject } from '@pandacss/types';

import { colorVariables, fontFamilyValues, fontVariables, paletteValues } from './tokens';

const rootProperties: Record<`--drk-${string}`, string> = {};
for (const [name, variable] of Object.entries(colorVariables)) {
    rootProperties[variable] = paletteValues[name as keyof typeof paletteValues];
}
rootProperties[fontVariables.body] = fontFamilyValues.body;

export const fragments: GlobalStyleObject[] = [
    {
        ':root': rootProperties,
    },
];
