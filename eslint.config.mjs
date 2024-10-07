import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default ts.config(
  { files: ['/src/**/*.{ts}'] },
  { ignores: ['**/*.{js,mjs,cjs}', 'drizzle.config.ts'] },
  js.configs.recommended,
  stylistic.configs.customize({
    semi: true,
    indent: 2,
    arrowParens: true,
    commaDangle: "always-multiline",
  }),
  ts.configs.eslintRecommended,
  ...ts.configs.recommendedTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        project: ["tsconfig.json"],
      },
    },
  },
  {
    rules: {
      "@stylistic/comma-spacing": ["warn"],
      "@stylistic/array-bracket-spacing": ["warn"],
      "@typescript-eslint/restrict-template-expressions": ["off"],
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "@typescript-eslint/prefer-nullish-coalescing": ["error", { ignorePrimitives: true }],
    }
  }
);
