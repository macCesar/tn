module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'commonjs'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': 'off', // CLI tool needs console output
    'prefer-const': 'error',
    'no-var': 'error'
  },
  globals: {
    'process': 'readonly',
    'console': 'readonly',
    '__dirname': 'readonly',
    'module': 'readonly',
    'require': 'readonly',
    'exports': 'readonly'
  }
};