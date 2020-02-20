/**
 * The "recommended" config, which can be referenced by its alias, `rtk:recommended`.
 * This is _also_ the _default_ config if no config file is used.
 * @type {import('../config').ConfigListItem[]}
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

/**
 * @type {import('../config').BuiltinConfigAliases}
 */
exports.alias = 'rtk:recommended';
