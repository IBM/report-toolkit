import {createDebugger, enableDebugger} from '../debug.js';

import {FORMAT_TABLE} from '../formatters';
import {loadConfig} from '../config';
import pkg from '../../package.json';
import yargs from 'yargs/yargs';

const GROUP_OUTPUT = 'Output:';

const debug = createDebugger(module);

export const main = () => {
  loadConfig().subscribe(configResult => {
    yargs()
      .parserConfiguration({'camel-case-expansion': false})
      .scriptName(pkg.name)
      .commandDir('commands')
      .demandCommand()
      .options({
        verbose: {
          alias: ['v', 'debug'],
          desc: 'Enable verbose output',
          global: true,
          group: GROUP_OUTPUT,
          type: 'boolean'
        }
      })
      .config({config: configResult})
      .env(pkg.name)
      .help()
      .version()
      .middleware(argv => {
        // "verbose" enables debug statements
        if (argv.verbose) {
          enableDebugger();
        }

        if (argv.format !== FORMAT_TABLE) {
          argv.color = false;
        }

        debug(argv);
        return argv;
      })
      .parse(process.argv.slice(2));
  });
};
