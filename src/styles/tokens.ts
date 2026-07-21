// Tokens de conception de Drake.css framework (D-013).
// Valeurs héritées des variables globales de la référence pré-Panda ; toute évolution
// suit la procédure de changement sensible (docs/fork/CHARTER.md §6). Les fragments de
// src/styles/ consomment ces constantes à la génération : la substitution est prouvée
// neutre par le diff de parité G15 (build/fork/css-parity.js).
import { defineTokens } from '@pandacss/dev';

// Points de rupture mobile-first : la base s'applique dès 320 px CSS,
// chaque niveau enrichit via min-width (docs/fork/MOBILE_FIRST_SEO.md).
export const breakpoints = {
    s: '640px',
    m: '960px',
    l: '1200px',
    xl: '1600px',
} as const;

// Bornes hautes des utilitaires bornés autorisés (max-width = breakpoint − 1px),
// réservées à l'allowlist fermée de MOBILE_FIRST_SEO.md.
export const breakpointsMax = {
    s: '639px',
    m: '959px',
    l: '1199px',
    xl: '1599px',
} as const;

// Palette sémantique héritée : source de vérité unique, consommée par les fragments
// et exposée aux tokens Panda ci-dessous.
export const palette = {
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

export const fontFamilies = {
    body: '"InterVariable", Inter, "Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
} as const;

export const tokens = defineTokens({
    colors: {
        text: { value: palette.text },
        emphasis: { value: palette.emphasis },
        muted: { value: palette.muted },
        inverse: { value: palette.inverse },
        background: { value: palette.background },
        mutedBackground: { value: palette.mutedBackground },
        primary: { value: palette.primary },
        secondary: { value: palette.secondary },
        success: { value: palette.success },
        warning: { value: palette.warning },
        danger: { value: palette.danger },
    },
    fonts: {
        body: { value: fontFamilies.body },
    },
    fontSizes: {
        base: { value: '16px' },
    },
    lineHeights: {
        base: { value: '1.5' },
    },
});
