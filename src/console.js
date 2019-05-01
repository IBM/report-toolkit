import {map, reduce, startWith} from 'rxjs/operators';

import Table from 'cli-table3';
import _ from 'lodash/fp';
import color from 'ansi-colors';
import termsize from 'term-size';
import {version} from '../package.json';
import wrapAnsi from 'wrap-ansi';

export const outputHeader = headerText =>
  color.grey('[') +
  color.cyanBright('gnostic') +
  ' ' +
  color.cyan(`v${version}`) +
  color.grey('] ') +
  color.magenta(headerText) +
  '\n';

const COL_WIDTH_PCTS = [3, 25, 36, 36];

const getColWidths = (colWidths = COL_WIDTH_PCTS) => {
  const {columns} = termsize();
  return colWidths.map(w => Math.floor((w / 100) * columns));
};

const TABLE_DEFAULT_OPTIONS = Object.freeze({
  chars: {
    bottom: '',
    'bottom-left': '',
    'bottom-mid': '',
    'bottom-right': '',
    left: '',
    'left-mid': '',
    mid: '─',
    'mid-mid': '',
    middle: '',
    right: '',
    'right-mid': '',
    top: '',
    'top-left': '',
    'top-mid': '',
    'top-right': ''
  },
  style: {head: []},
  wordWrap: true
});

export const createTable = (headers, opts = {}) => {
  opts = _.defaultsDeep(TABLE_DEFAULT_OPTIONS, opts);
  if (opts.stretch && (opts.truncateValues || opts.wrapValues)) {
    opts.colWidths = getColWidths(opts.colWidthsPct);
  }
  return new Table(_.assign(opts, {head: headers.map(color.underline)}));
};

export const toTable = (iteratee, headers, opts = {}) => {
  const table = createTable(headers, opts);
  return observable =>
    observable.pipe(
      reduce((t, val) => {
        let cols = iteratee(val);
        if (opts.stretch && opts.wrapValues) {
          cols = cols.map((col, idx) =>
            wrapAnsi(
              col,
              table.options.colWidths[idx] -
                table.options.style['padding-left'] -
                table.options.style['padding-right'],
              {
                hard: true,
                wordWrap: false
              }
            )
          );
        }
        t.push(cols);
        return t;
      }, table)
    );
};

export const toString = (header = '', footer = '') => observable =>
  observable.pipe(
    map(String),
    startWith(outputHeader(header))
  );

export const ok = text => color.green('✓') + ' ' + color.greenBright(text);
export const fail = text => color.red('✕') + ' ' + color.redBright(text);
