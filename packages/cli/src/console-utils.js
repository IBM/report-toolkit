import {_, observable} from '@gnostic/common';
import * as commonFormatters from '@gnostic/formatters';
import colors from 'kleur';
import {error, success} from 'log-symbols';
import stripAnsi from 'strip-ansi';
import termsize from 'term-size';

import {table} from './table-formatter.js';

const {map, pipeIf} = observable;

const formatters = {...commonFormatters, table};

export const ok = text =>
  colors.green(success) + ' ' + colors.green().bold(text);

export const fail = text => colors.red(error) + ' ' + colors.red().bold(text);

export const toFormattedString = (format, opts = {}) => observable =>
  observable.pipe(
    formatters[format](_.defaults({maxWidth: termsize().columns}, opts)),
    map(String),
    pipeIf(opts.color === false, map(stripAnsi))
  );

export {colors};
