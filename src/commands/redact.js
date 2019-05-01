import {map} from 'rxjs/operators';
import {readReport} from '../read-report';
import {writeFileSync} from 'fs';

export const command = 'redact <file>';

export const desc = 'Print redacted report file to STDOUT';

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
    .pipe(map(report => JSON.stringify(report, null, 2)))
    .subscribe(json => {
      if (output) {
        return writeFileSync(output, json);
      }
      console.log(json);
    });
};
