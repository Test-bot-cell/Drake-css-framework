// Tokens de conception de Drake.css framework (D-013).
// Valeurs héritées des variables globales de la référence pré-Panda ; toute évolution
// suit la procédure de changement sensible (docs/fork/CHARTER.md §6).
import { defineTokens } from '@pandacss/dev';

// Points de rupture mobile-first : la base s'applique dès 320 px CSS,
// chaque niveau enrichit via min-width (docs/fork/MOBILE_FIRST_SEO.md).
export const breakpoints = {
    s: '640px',
    m: '960px',
    l: '1200px',
    xl: '1600px',
} as const;

export const tokens = defineTokens({
    colors: {
        text: { value: '#666' },
        emphasis: { value: '#333' },
        muted: { value: '#999' },
        inverse: { value: '#fff' },
        background: { value: '#fff' },
        mutedBackground: { value: '#f8f8f8' },
        primary: { value: '#1e87f0' },
        secondary: { value: '#222' },
        success: { value: '#32d296' },
        warning: { value: '#faa05a' },
        danger: { value: '#f0506e' },
    },
    fonts: {
        body: {
            value: '"InterVariable", Inter, "Inter Fallback", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        },
    },
    fontSizes: {
        base: { value: '16px' },
    },
    lineHeights: {
        base: { value: '1.5' },
    },
});
