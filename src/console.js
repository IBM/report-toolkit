import * as formatter from './formatter';

import colors from 'ansi-colors';
import {map} from 'rxjs/operators';
import {pipeIf} from './operators';
import stripAnsi from 'strip-ansi';

export const ok = text => colors.green('✓') + ' ' + colors.greenBright(text);
export const fail = text => colors.red('✕') + ' ' + colors.redBright(text);

export const asFormat = (format, opts = {}) => observable =>
  observable.pipe(formatter[format](opts));

export const asString = ({color} = {}) => observable =>
  observable.pipe(
    map(String),
    // not particularly efficient, but easier than dropping conditionals
    // wherever color is used
    pipeIf(color === false, map(stripAnsi))
  );
