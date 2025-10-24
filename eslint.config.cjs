module.exports = [
  // ignora node_modules
  { ignores: ['node_modules/**'] },

  // reglas para ficheros JS
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    rules: {}
  },

  // reglas para TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module'
      },
      globals: {}
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
      // 'playwright': require('eslint-plugin-playwright') // descomenta si instalas el plugin
    },
    rules: {
      // reglas base TS (ajusta según prefieras)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
];