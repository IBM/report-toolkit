#!/usr/bin/env node

const filepath = process.argv[2];

if (!filepath) {
  console.error('print redacted JSON file to STDOUT');
  throw new Error(`usage: ${__filename} <filename.json>`);
}

const esmRequire = require('esm')(module);
const {map} = require('rxjs/operators');
const {readReport} = esmRequire('../src/reader');

readReport(filepath)
  .pipe(map(report => JSON.stringify(report, null, 2)))
  .subscribe(json => {
    console.log(json);
  });
