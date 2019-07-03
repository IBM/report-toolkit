#!/usr/bin/env node

'use strict';

const esmRequire = require('esm')(module);
const cli = esmRequire('./src/index.js');

if (require.main === module) {
  cli.main();
}

module.exports = cli;
