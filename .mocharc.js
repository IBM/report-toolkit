'use strict';

module.exports = {
  color: true,
  'experimental-report': true,
  'forbid-only': Boolean(process.env.CI),
  'no-warnings': true,
  require: ['esm', require.resolve('./packages/common/test/setup.js')],
  spec: './packages/*/test/**/*.spec.js'
};
