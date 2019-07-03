'use strict';

const pkg = require('./package.json.js');
const esmRequire = require('esm')(module);
module.exports = esmRequire(pkg.module);
