/* eslint-env node */
module.exports = {
  extends: [
    '@gidw/eslint-config-standard'
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/**/*',
    '*.min.js'
  ],
  rules: {
    'no-shadow': 'error'
  }
}
