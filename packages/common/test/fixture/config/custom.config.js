exports.config = [
  'report-toolkit:recommended',
  {
    name: 'CUSTOM',
    rules: {
      'library-mismatch': 'off',
      'long-timeout': ['on', {timeout: 3000}]
    }
  }
];
