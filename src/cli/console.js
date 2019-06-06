import * as formatters from '../formatters';

import {error, success} from 'log-symbols';
import {map, pipeIf} from '../observable';

import _ from 'lodash';
import colors from './colors';
import stripAnsi from 'strip-ansi';
import termsize from 'term-size';

export const ok = text =>
  colors.green(success) + ' ' + colors.green().bold(text);
export const fail = text => colors.red(error) + ' ' + colors.red().bold(text);

export const toFormattedString = (format, opts = {}) => observable =>
  observable.pipe(
    formatters[format](_.defaults({maxWidth: termsize().columns}, opts)),
    map(String),
    pipeIf(opts.color === false, map(stripAnsi))
  );
