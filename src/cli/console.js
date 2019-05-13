import * as formatter from '../formatter';

import _ from 'lodash';
import colors from 'ansi-colors';
import {map} from 'rxjs/operators';
import {pipeIf} from '../operators';
import stripAnsi from 'strip-ansi';
import termsize from 'term-size';

export const ok = text => colors.green('✓') + ' ' + colors.greenBright(text);
export const fail = text => colors.red('✕') + ' ' + colors.redBright(text);

export const toFormattedString = (format, opts = {}) => observable =>
  observable.pipe(
    formatter[format](_.defaults({maxWidth: termsize().columns}, opts)),
    map(String),
    pipeIf(opts.color === false, map(stripAnsi))
  );
