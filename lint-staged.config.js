'use strict';

module.exports = {
  '*.js': ['eslint --fix'],
  '*.{yml,md,mdx,toml}': ['prettier --write'],
  'packages/*/package.json': ['syncpack format'],
  './README.md': [
    'sync-monorepo-packages --no-package-json -p packages/report-toolkit --force README.md',
    'git add packages/report-toolkit/README.md'
  ]
};
