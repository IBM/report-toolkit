#!/usr/bin/env node

const {execSync} = require('child_process');
const {writeFileSync} = require('fs');
const {resolve} = require('path');

const cliPath = require.resolve(
  '../packages/cli/dist/report-toolkit-cli.cjs.js'
);

const OUTPUT_PATH = resolve(
  __dirname,
  '..',
  'packages',
  'docs',
  'src',
  'pages',
  'quick-start',
  'cli-output.txt'
);

const stdout = execSync(`${cliPath} --help`);
writeFileSync(OUTPUT_PATH, stdout);
