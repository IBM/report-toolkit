/**
 * The "recommended" config, which can be referenced by its alias,
 * `rtk:recommended`.  This is _also_ the _default_ config if no config file is
 * used.
 **/
exports.config = [
  {
    rules: {
      'cpu-usage': true,
      'library-mismatch': true,
      'long-timeout': true,
      'memory-usage': true
    }
  }
];

exports.alias = 'rtk:recommended';
