exports.config = [
  'gnostic:recommended',
  {
    rules: {
      'long-timeout': ['on', {timeout: 3000}],
      'library-mismatch': 'off'
    }
  }
];
