import {OPTIONS} from './common';
import {loadReport} from '../../api/observable';
import {map} from 'rxjs/operators';
import stringify from 'fast-safe-stringify';
import {writeFileSync} from 'fs';

export const command = 'redact <file>';

export const desc = 'Print redacted report file in JSON format to STDOUT';

export const builder = yargs =>
  yargs.options({
    output: OPTIONS.OUTPUT.output
  });

export const handler = ({file, output} = {}) => {
  loadReport(file)
    .pipe(map(report => stringify(report, null, 2)))
    .subscribe(json => {
      if (output) {
        return writeFileSync(output, json);
      }
      console.log(json);
    });
};
