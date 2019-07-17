import {_, createDebugPipe, observable} from '@report-toolkit/common';
import * as commonFormatters from '@report-toolkit/formatters';
import colors from 'kleur';
import {error, success} from 'log-symbols';
import stripAnsi from 'strip-ansi';
import termsize from 'term-size';

import {table} from './table-formatter.js';

const debug = createDebugPipe('cli', 'console-utils');

const {map, pipeIf} = observable;

const formatters = {...commonFormatters, table};

const FIELD_COLORS = Object.freeze(['cyan', 'magenta', 'blue', 'green']);

const DEFAULTS_FORMATTED_STRING = Object.freeze({
  color: true,
  fields: [],
  maxWidth: termsize().columns,
  pretty: false
});

const normalizeFields = _.pipe(
  _.toPairs,
  _.map(([idx, field]) => {
    // a field can have a string `color`, no `color`, or a function which accepts a `row` and returns a string.
    // likewise, it can have a `value` function which accepts a `row` and returns a value, or just a string, which
    // corresponds to a property of the `row` object.
    const fieldColor = field.color || FIELD_COLORS[idx % FIELD_COLORS.length];
    const colorFn = _.isFunction(fieldColor)
      ? (row, value) => {
          // the function might not return a color
          const color =
            colors[fieldColor(row)] || FIELD_COLORS[idx % FIELD_COLORS.length];
          return colors[color](value);
        }
      : (row, value) => colors[fieldColor](value);
    const valueFn = _.isFunction(field.value)
      ? row => field.value(row)
      : _.get(field.value);
    return {
      ...field,
      value: row => colorFn(row, valueFn(row))
    };
  })
);

export const ok = text =>
  colors.green(success) + ' ' + colors.green().bold(text);

export const fail = text => colors.red(error) + ' ' + colors.red().bold(text);

export const toFormattedString = (format, opts = {}) => {
  let {
    color,
    fields,
    outputHeader,
    pretty,
    truncateValues,
    wrapValues
  } = _.defaults(DEFAULTS_FORMATTED_STRING, opts);
  fields = normalizeFields(fields);
  const formatter = formatters[format];
  return observable =>
    observable.pipe(
      debug(() => [`using normalized fields %O`, fields]),
      formatter({
        fields,
        outputHeader,
        pretty,
        truncateValues,
        wrapValues
      }),
      // note: _.toString() cannot be used here, as it apparently doesn't invoke
      // the `toString()` method of the object
      map(String),
      pipeIf(color === false, map(stripAnsi))
    );
};

export {colors};
