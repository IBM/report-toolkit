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

const BASE_WINDOW_WIDTH = 80;
const COLUMN_WIDTHS = [2, 14, 32, 32];

const getColWidths = () => {
  const {columns} = termsize();
  return COLUMN_WIDTHS.map(w => Math.floor((w / BASE_WINDOW_WIDTH) * columns));
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

export const ok = text => color.green('✓') + ' ' + color.greenBright(text);
export const fail = text => color.red('✕') + ' ' + color.redBright(text);
