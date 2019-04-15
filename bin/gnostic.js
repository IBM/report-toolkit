#!/usr/bin/env node

'use strict';

const esmRequire = require('esm')(module);
const cli = esmRequire('./lib/cli');

if (require.main === module) {
  cli.main();
}

module.exports = cli;
