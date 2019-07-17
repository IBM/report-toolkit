exports.config = [
  'report-toolkit:recommended',
  {
    rules: {
      'long-timeout': ['on', {timeout: 5000}]
    }
  }
];
