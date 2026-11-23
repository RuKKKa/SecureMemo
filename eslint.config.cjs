module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    ignores: ['postcss.config.js', 'tailwind.config.js', 'vite.config.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];