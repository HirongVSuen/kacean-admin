/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:vue/recommended'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    'vue/require-default-prop': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}
