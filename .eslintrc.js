module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'standard'
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/**/*'
  ]
}
