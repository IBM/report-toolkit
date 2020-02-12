exports.config = [
  'rtk:recommended',
  {
    name: 'DEFAULT',
    rules: {
      'long-timeout': ['on', {timeout: 4000}],
      'library-mismatch': 'off'
    }
  }
];
