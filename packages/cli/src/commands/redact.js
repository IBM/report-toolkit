import {observable} from '@report-toolkit/common';
import {json} from '@report-toolkit/formatters';
import {toObjectFromFilepath} from '@report-toolkit/fs';
import {writeFileSync} from 'fs';

import {OPTIONS} from './common.js';

const {fromAny} = observable;

export const command = 'redact <file>';

export const desc = 'Print redacted report file in JSON format to STDOUT';

export const builder = yargs =>
  yargs.options({
    output: OPTIONS.OUTPUT.output,
    pretty: {...OPTIONS.OUTPUT.pretty, default: true}
  });

export const handler = ({
  config,
  file: filepaths,
  output,
  pretty = true
} = {}) => {
  fromAny(filepaths)
    .pipe(
      toObjectFromFilepath(config.redact),
      json({pretty})
    )
    .subscribe(json => {
      if (output) {
        return writeFileSync(output, json);
      }
      console.log(json);
    });
};
