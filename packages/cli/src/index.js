import {_} from '@gnostic/common';
import {NAMESPACE} from '@gnostic/common/src/constants.js';
import {createDebugger, enableDebugger} from '@gnostic/common/src/debug.js';
import {fromFilesystemToConfig} from '@gnostic/fs';
import yargs from 'yargs/yargs.js';

import {GROUPS} from './commands/common.js';
import {FORMAT_TABLE} from './table-formatter.js';

const debug = createDebugger('cli');

/**
 * @todo support color JSON output if TTY
 */
export const main = () => {
  yargs()
    .scriptName(NAMESPACE)
    .commandDir('commands')
    .demandCommand()
    .options({
      verbose: {
        alias: ['v', 'debug'],
        desc: 'Enable verbose output',
        global: true,
        group: GROUPS.OUTPUT,
        type: 'boolean'
      },
      rc: {
        desc: 'Custom file or directory path to .gnosticrc.js',
        normalize: true,
        requiresArg: true,
        type: 'string'
      }
    })
    .wrap(process.stdout.columns ? Math.min(process.stdout.columns, 100) : 80)
    .env(NAMESPACE)
    .help()
    .version()
    .middleware(async argv => {
      debug('parsed CLI arguments: %O', argv);

      // "verbose" enables debug statements
      if (argv.verbose) {
        enableDebugger();
      }

      // any format other than the default "table" will not be in color
      argv.color = _.isUndefined(argv.color)
        ? argv.format !== FORMAT_TABLE
        : argv.color;

      argv.config = await fromFilesystemToConfig(argv.rc).toPromise();

      return argv;
    })
    .parse(process.argv.slice(2));
};
