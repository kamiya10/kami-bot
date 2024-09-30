import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default ts.config(
  { files: ['/src/**/*.{ts}'] },
  { ignores: ['**/*.{js,mjs,cjs}'] },
  js.configs.recommended,
  stylistic.configs.customize({
    semi: true,
    indent: 2,
    arrowParens: true,
  }),
  ts.configs.eslintRecommended,
  ...ts.configs.recommendedTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "@typescript-eslint/prefer-nullish-coalescing": ["error", { ignorePrimitives: true }],
    }
  }
);
