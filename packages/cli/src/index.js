import {_, constants, createDebugger, enableDebugger} from '@gnostic/common';
import {fromFilesystemToConfig} from '@gnostic/fs';
import yargs from 'yargs/yargs.js';

import {GROUPS} from './commands/common.js';
import * as commands from './commands/index.js';
import {FORMAT_TABLE} from './table-formatter.js';

const {NAMESPACE} = constants;

const debug = createDebugger('cli', 'main');

/**
 * @todo support color JSON output if TTY
 */
const main = () => {
  Object.values(commands)
    .reduce(
      (parser, command) => parser.command(command),
      yargs()
        .scriptName(NAMESPACE)
        .demandCommand()
        .options({
          rc: {
            desc: 'Custom file or directory path to .gnosticrc.js',
            normalize: true,
            requiresArg: true,
            type: 'string'
          },
          verbose: {
            alias: ['v', 'debug'],
            desc: 'Enable verbose output',
            global: true,
            group: GROUPS.OUTPUT,
            type: 'boolean'
          }
        })
        .wrap(
          process.stdout.columns ? Math.min(process.stdout.columns, 100) : 80
        )
        .env(NAMESPACE)
        .help()
        .version()
        .middleware(async argv => {
          // "verbose" enables debug statements
          if (argv.verbose) {
            enableDebugger();
          }

          debug('parsed CLI arguments: %O', argv);
          // any format other than the default "table" will not be in color
          argv.color = _.isUndefined(argv.color)
            ? argv.format !== FORMAT_TABLE
            : argv.color;

          argv.config = await fromFilesystemToConfig(argv.rc).toPromise();

          return argv;
        })
    )
    .parse(process.argv.slice(2));
};

if (require.main === module) {
  main();
}

export {main};
