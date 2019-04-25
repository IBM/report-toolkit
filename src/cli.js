import {enableDebugger} from './debug.js';
import {fromDir} from './config';
import pkg from '../package.json';
import yargs from 'yargs/yargs';

const GROUP_OUTPUT = 'Output:';

export const main = async () => {
  const configResult = await fromDir();
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
    .config(configResult)
    .env(pkg.name)
    .help()
    .fail((msg, err, yargs) => {
      // if `msg` is present, this is a "handled" error.
      if (msg) {
        console.error(`${yargs.help()}\n`);
      }

      if (err) {
        throw err;
      }
    })
    .version()
    .middleware(argv => {
      // "verbose" enables debug statements
      if (argv.verbose) {
        enableDebugger(module, '*');
      }

      return argv;
    })
    .parse(process.argv.slice(2));
};
