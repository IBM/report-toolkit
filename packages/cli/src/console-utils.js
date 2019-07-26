import {colors, constants, observable} from '@report-toolkit/common';
import {writeFile as writeFileFs} from 'fs';
import {error, success} from 'log-symbols';
import stripAnsi from 'strip-ansi';
import termsize from 'term-size';

const {bindNodeCallback, iif, map, mergeMap, of, pipeIf, tap} = observable;
const {DEFAULT_TERMINAL_WIDTH} = constants;
const writeFile = bindNodeCallback(writeFileFs);

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

export const terminalColumns = termsize().columns || DEFAULT_TERMINAL_WIDTH;
