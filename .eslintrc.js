module.exports = {
  env: {
    node: true,
    es2020: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': 'off',
    'max-len': ['error', { code: 100 }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['tests/**/*.js'] }],
  },
};
