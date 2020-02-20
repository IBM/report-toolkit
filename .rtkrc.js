/**
 * @type {import('./packages/common/src/config').ExportedConfig}
 */
exports.config = [
  'rtk:recommended',
  {
    rules: {
      'long-timeout': {timeout: 5000}
    }
  }
];
