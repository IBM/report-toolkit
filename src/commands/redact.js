import {map} from 'rxjs/operators';
import {readReport} from '../api/observable';
import stringify from 'fast-safe-stringify';
import {writeFileSync} from 'fs';

export const command = 'redact <file>';

export const desc = 'Print redacted report file in JSON format to STDOUT';

export const builder = yargs =>
  yargs.options({
    output: {
      type: 'string',
      normalize: true,
      requiresArg: true,
      description: 'Output to file instead of STDOUT',
      group: 'Output:',
      alias: 'o'
    }
  });

export const handler = ({file, output} = {}) => {
  readReport(file)
    .pipe(map(report => stringify(report, null, 2)))
    .subscribe(json => {
      if (output) {
        return writeFileSync(output, json);
      }
      console.log(json);
    });
};
