exports.config = [
  'gnostic:recommended',
  {
    rules: {
      'long-timeout': ['on', {timeout: 5000}]
    }
  }
];
