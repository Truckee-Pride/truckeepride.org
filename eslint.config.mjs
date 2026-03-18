import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'UnaryExpression[operator="!"][argument.type="UnaryExpression"][argument.operator="!"]',
          message: 'Avoid !!value — use value != null to check for null/undefined.',
        },
      ],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
    },
  },
];

export default eslintConfig;
