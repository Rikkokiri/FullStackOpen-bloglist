module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    // This always needs to remain as the last one:
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'arrow-spacing': ['error', { before: true, after: true }],
    eqeqeq: 'error',
    'linebreak-style': ['error', 'unix'],
    'no-console': 0,
    'no-trailing-spaces': 'error',
    'no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'prettier/prettier': 'error',
  },
}
