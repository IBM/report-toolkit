#!/usr/bin/env node

const esmRequire = require('esm')(module);
const {main} = esmRequire('./main');

if (require.main === module) {
  main();
}
