'use strict';

module.exports = {
  color: true,
  'experimental-report': true,
  'forbid-only': Boolean(process.env.CI),
  'no-warnings': true,
  timeout: 5000,
  slow: 2000,
  require: ['esm', require.resolve('./packages/common/test/setup.js')]
};
