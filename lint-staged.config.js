'use strict';

module.exports = {
  '*.js': ['eslint --fix'],
  '*.{yml,md,mdx}': ['prettier --write'],
  'packages/*/package.json': () => ['syncpack format']
};
