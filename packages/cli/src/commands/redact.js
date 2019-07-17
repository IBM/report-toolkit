import {OPTIONS} from './common.js';
import {handler as transform} from './transform.js';

export const command = 'redact <file>';

export const desc = 'Shortcut for "transform redact --pretty"';

export const builder = yargs =>
  yargs.options({
    output: OPTIONS.OUTPUT.output
  });

export const handler = (opts = {}) => {
  transform({...opts, pretty: true, transformer: 'redact'});
};
