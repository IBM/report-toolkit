#!/usr/bin/env node

import {main} from '@report-toolkit/cli';
import * as core from '@report-toolkit/core';

if (require.main === module) {
  main();
}

export default core;
