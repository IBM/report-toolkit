exports.config = [
  'rtk:recommended',
  {
    rules: {
      'long-timeout': ['on', {timeout: 5000}]
    }
  }
];
