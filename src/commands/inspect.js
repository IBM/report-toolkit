import {reporter, tableHeader} from '../cli-reporter';

import {inspect} from '../api';

export const command = 'inspect <file..>';

export const desc = 'Inspect diagnostic report JSON against rules';

export const builder = yargs => yargs.positional('file', {type: 'array'});

export const handler = async ({file, config}) => {
  const results = await inspect(file, {config, autoload: false});
  if (!results.length) {
    reporter.success(`${file} contains no known issues`);
  } else {
    reporter.table(
      tableHeader(['Rule ID', 'Message', 'Data']),
      results.map(({id, message, data}) => [
        reporter.format.green(id),
        message,
        JSON.stringify(data)
      ])
    );
  }
};
