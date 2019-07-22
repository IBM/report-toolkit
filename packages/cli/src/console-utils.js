import {_, observable} from '@report-toolkit/common';
import {writeFile as writeFileFs} from 'fs';
import colors from 'kleur';
import {error, success} from 'log-symbols';
import stripAnsi from 'strip-ansi';

const {bindNodeCallback, iif, map, mergeMap, of, pipeIf, tap} = observable;

const writeFile = bindNodeCallback(writeFileFs);

const FIELD_COLORS = Object.freeze(['cyan', 'magenta', 'blue', 'green']);

export const normalizeFields = _.pipe(
  _.toPairs,
  _.map(
    /**
     * @param {[number, import('packages/transformers/src/transformer').Field]} value
     */
    ([idx, field]) => {
      // a field can have a string `color`, no `color`, or a function which accepts a `row` and returns a string.
      // likewise, it can have a `value` function which accepts a `row` and returns a value, or just a string, which
      // corresponds to a property of the `row` object.
      const fieldColor = field.color || FIELD_COLORS[idx % FIELD_COLORS.length];
      const colorFn = _.isFunction(fieldColor)
        ? (row, value) => {
            // the function might not return a color
            const color =
              colors[fieldColor(row)] ||
              FIELD_COLORS[idx % FIELD_COLORS.length];
            return colors[color](value);
          }
        : (row, value) => colors[/** @type {string} */ (fieldColor)](value);
      const valueFn = _.isFunction(field.value)
        ? row => {
            // yuck
            const fn =
              /**
               * @type {function(typeof row): string}
               */ (field.value);
            return fn(row);
          }
        : _.get(field.value);
      return {
        ...field,
        value: row => colorFn(row, valueFn(row))
      };
    }
  )
);

export const ok = text =>
  colors.green(success) + ' ' + colors.green().bold(text);

export const fail = text => colors.red(error) + ' ' + colors.red().bold(text);

/**
 * Writes CLI output to file or STDOUT
 * @todo might want to be moved to commands/common.js
 * @todo probably emits stuff it shouldn't
 * @param {string} [filepath] - If present, will write to file
 * @param {Object} [opts]
 * @param {boolean} [opts.color=true]
 */
export const toOutput = (filepath, {color = true} = {}) => observable =>
  observable.pipe(
    map(String),
    pipeIf(color === false, map(stripAnsi)),
    mergeMap(output =>
      iif(
        () => Boolean(filepath),
        writeFile(filepath, output),
        of(output).pipe(
          tap(res => {
            console.log(res);
          })
        )
      )
    )
  );

export {colors};
