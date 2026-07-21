// Tokens de conception de Drake.css framework (D-013, D-016).
// Valeurs héritées des variables globales de la référence pré-Panda ; toute évolution
// suit la procédure de changement sensible (docs/fork/CHARTER.md §6).
//
// Depuis D-016, le sous-ensemble sémantique est exposé en propriétés personnalisées
// `--drk-*` : `:root` publie les valeurs (src/styles/root-tokens.ts) et les fragments
// consomment `var(--drk-…, <valeur héritée>)` — le repli garantit l'équivalence calculée
// avec la feuille historique, prouvée par les gates navigateur.
import { defineTokens } from '@pandacss/dev';

// Points de rupture mobile-first : la base s'applique dès 320 px CSS,
// chaque niveau enrichit via min-width (docs/fork/MOBILE_FIRST_SEO.md).
// Les media queries n'acceptant pas var(), les breakpoints restent build-time.
export const breakpoints = {
    s: '640px',
    m: '960px',
    l: '1200px',
    xl: '1600px',
} as const;

// Bornes hautes des breakpoints (max-width = breakpoint − 1px). Documentaire : les
// conditions max-width de l'allowlist fermée (MOBILE_FIRST_SEO.md) restent LITTÉRALES
// dans les fragments, car l'allowlist et son scanner comparent la condition textuelle
// exacte ; ces constantes servent de référence et à tout usage futur décidé.
export const breakpointsMax = {
    s: '639px',
    m: '959px',
    l: '1199px',
    xl: '1599px',
} as const;

// Palette sémantique héritée : valeurs brutes, source de vérité unique.
export const paletteValues = {
    text: '#666',
    emphasis: '#333',
    muted: '#999',
    inverse: '#fff',
    background: '#fff',
    mutedBackground: '#f8f8f8',
    primary: '#1e87f0',
    secondary: '#222',
    success: '#32d296',
    warning: '#faa05a',
    danger: '#f0506e',
} as const;

// Noms publics des propriétés personnalisées (surfaces protégées, D-016).
export const colorVariables = {
    text: '--drk-color-text',
    emphasis: '--drk-color-emphasis',
    muted: '--drk-color-muted',
    inverse: '--drk-color-inverse',
    background: '--drk-color-background',
    mutedBackground: '--drk-color-muted-background',
    primary: '--drk-color-primary',
    secondary: '--drk-color-secondary',
    success: '--drk-color-success',
    warning: '--drk-color-warning',
    danger: '--drk-color-danger',
} as const;

type PaletteName = keyof typeof paletteValues;

// Références consommées par les fragments : var(--drk-…, <valeur héritée>).
export const palette = Object.fromEntries(
    (Object.keys(paletteValues) as PaletteName[]).map((name) => [
        name,
        `var(${colorVariables[name]}, ${paletteValues[name]})`,
    ]),
) as Record<PaletteName, string>;

export const fontVariables = {
    body: '--drk-font-body',
} as const;

export const fontFamilyValues = {
    body: '"InterVariable", Inter, "Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
} as const;

export const fontFamilies = {
    body: `var(${fontVariables.body}, ${fontFamilyValues.body})`,
} as const;

export const tokens = defineTokens({
    colors: {
        text: { value: paletteValues.text },
        emphasis: { value: paletteValues.emphasis },
        muted: { value: paletteValues.muted },
        inverse: { value: paletteValues.inverse },
        background: { value: paletteValues.background },
        mutedBackground: { value: paletteValues.mutedBackground },
        primary: { value: paletteValues.primary },
        secondary: { value: paletteValues.secondary },
        success: { value: paletteValues.success },
        warning: { value: paletteValues.warning },
        danger: { value: paletteValues.danger },
    },
    fonts: {
        body: { value: fontFamilyValues.body },
    },
    fontSizes: {
        base: { value: '16px' },
    },
    lineHeights: {
        base: { value: '1.5' },
    },
});
