// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-host-metadata-property': 'off',
      // Inline templates and styles are fine for tiny components only;
      // anything of 6 lines or more belongs in its own .html / .css file.
      '@angular-eslint/component-max-inline-declarations': ['error', { template: 5, styles: 5 }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      'no-console': 'error',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },
  {
    files: ['projects/hyalo/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'hy', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'hy', style: 'kebab-case' },
      ],
    },
  },
  {
    // Each folder next to src/ is its own entry point. A relative import into
    // another one would compile a second copy of it, with its own tokens and
    // services, so dependency injection would quietly stop matching.
    files: ['projects/hyalo/*/*.ts'],
    ignores: ['projects/hyalo/src/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '!../src', '!../src/testing/*'],
              message: 'Import other entry points by package path, like @hyalo/angular/icon.',
            },
          ],
        },
      ],
    },
  },
  {
    // The primary entry point is the base layer and never imports the others.
    files: ['projects/hyalo/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@hyalo/angular', '@hyalo/angular/*'],
              message: 'The primary entry point must not depend on another entry point.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['projects/docs/**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'docs', style: 'kebab-case' },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // Test hosts keep their fixture markup next to the assertions.
      '@angular-eslint/component-max-inline-declarations': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
]);
