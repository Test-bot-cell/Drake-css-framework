import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const frontendFiles = ['src/js/**/*.ts', 'tests/js/**/*.ts'];

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    {
        ...eslintJs.configs.recommended,
        files: ['build/**/*.js', 'eslint.config.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
    },
    {
        ...eslintJs.configs.recommended,
        files: frontendFiles,
    },
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: frontendFiles,
    })),
    {
        files: frontendFiles,
        rules: {
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                VERSION: 'readonly',
                LOG: 'readonly',
                ICONS: 'readonly',
                NAME: 'readonly',
            },
        },
    },
    eslintConfigPrettier,
);
