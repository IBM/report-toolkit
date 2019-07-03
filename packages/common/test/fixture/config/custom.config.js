exports.config = [
  'gnostic:recommended',
  {
    name: 'CUSTOM',
    rules: {
      'long-timeout': ['on', {timeout: 3000}],
      'library-mismatch': 'off'
    }
  }
];
