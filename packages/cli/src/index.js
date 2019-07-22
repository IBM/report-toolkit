import {
  _,
  constants as commonConstants,
  createDebugger,
  enableDebugger
} from '@report-toolkit/common';
import {
  constants as fsConstants,
  fromFilesystemToConfig
} from '@report-toolkit/fs';
import yargs from 'yargs/yargs.js';

import {GROUPS} from './commands/common.js';
import * as commands from './commands/index.js';

const {DEFAULT_TRANSFORMER, NAMESPACE} = commonConstants;

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
          debug: {
            alias: ['verbose'],
            desc: 'Enable debug output',
            global: true,
            group: GROUPS.OUTPUT,
            type: 'boolean'
          },
          rc: {
            desc: `Custom file or directory path to ${fsConstants.RC_FILENAME}`,
            normalize: true,
            requiresArg: true,
            type: 'string'
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
            ? argv.format !== DEFAULT_TRANSFORMER
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
