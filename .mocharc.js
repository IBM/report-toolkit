'use strict';

module.exports = {
  'no-warnings': true,
  'experimental-report': true,
  require: ['esm', 'test/setup'],
  'forbid-only': Boolean(process.env.CI)
};
