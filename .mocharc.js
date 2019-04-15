'use strict';

module.exports = {
  require: ['esm', 'test/setup'],
  'forbid-only': Boolean(process.env.CI),
  recursive: true
};
