import {map, reduce, startWith} from 'rxjs/operators';

import Table from 'cli-table3';
import _ from 'lodash/fp';
import color from 'ansi-colors';
import termsize from 'term-size';
import {version} from '../package.json';

export const outputHeader = headerText =>
  color.grey('[') +
  color.cyanBright('gnostic') +
  ' ' +
  color.cyan(`v${version}`) +
  color.grey('] ') +
  color.magenta(headerText) +
  '\n';

const COL_WIDTH_PCTS = [3, 25, 36, 36];

const getColWidths = () => {
  const {columns} = termsize();
  return COL_WIDTH_PCTS.map(w => Math.floor((w / 100) * columns));
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
  if (opts.stretch) {
    opts.colWidths = getColWidths();
  }
  return new Table(_.assign(opts, {head: headers.map(color.underline)}));
};

export const table$ = (iteratee, headers, opts = {}) => observable =>
  observable.pipe(
    reduce((t, val) => {
      t.push(iteratee(val));
      return t;
    }, createTable(headers, opts))
  );

export const renderTable$ = (header = '', footer = '') => observable =>
  observable.pipe(
    map(String),
    startWith(outputHeader(header))
  );

export const ok = text => color.green('✓') + ' ' + color.greenBright(text);
export const fail = text => color.red('✕') + ' ' + color.redBright(text);
