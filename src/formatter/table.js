import {map, reduce, startWith} from 'rxjs/operators';

import CLITable3 from 'cli-table3';
import _ from 'lodash/fp';
import colors from 'ansi-colors';
import {pipeIf} from '../operators';
import termsize from 'term-size';
import {version} from '../../package.json';
import wrapAnsi from 'wrap-ansi';

const DEFAULT_TABLE_OPTS = {
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
  colWidthPcts: [],
  fields: [],
  style: {
    head: []
  },
  wordWrap: true
};

const fieldWidthPcts = _.pipe(
  _.map('widthPct'),
  _.map(Number)
);

const prependTitle = headerText =>
  colors.grey('[') +
  colors.cyanBright('gnostic') +
  ' ' +
  colors.cyan(`v${version}`) +
  colors.grey('] ') +
  colors.magenta(headerText) +
  '\n';

/**
 * This little nasty accepts a list of field objects with `widthPct`
 * props.  In case of bad weirdnessjust count the fields and return
 * a list of equal column widths.
 * @todo "Infinity" should be a problem
 */
const normalizeColWidthPcts = _.pipe(
  fields => {
    const fieldsCount = _.size(fields);
    const colWidthPcts = fieldWidthPcts(fields);
    return _.some(_.isNaN, colWidthPcts) || _.sum(colWidthPcts) > 100
      ? new Array(fieldsCount).fill(Math.floor(100 / fieldsCount))
      : colWidthPcts;
  },
  _.map(_.clamp(0, 100))
);

const calculateColumnWidths = (fields = [], colWidthPcts = []) => {
  const {columns: terminalWidth} = termsize();
  return _.map(
    pct => Math.floor((pct / 100) * terminalWidth),
    normalizeColWidthPcts(fields, colWidthPcts)
  );
};

const formatTableHeaders = _.pipe(
  _.map('label'),
  _.map(colors.underline)
);

export const createTable = (opts = {}) => {
  opts = _.defaultsDeep(DEFAULT_TABLE_OPTS, opts);
  const {fields, truncateValues, wrapValues} = opts;
  if (_.some('widthPct', fields) && (truncateValues || wrapValues)) {
    opts.colWidths = calculateColumnWidths(fields);
  }
  return new CLITable3({
    ...opts,
    head: formatTableHeaders(fields)
  });
};

const colValuesByFields = _.curry((fields, row) =>
  _.map(_.invokeArgs('value', [row]), fields)
);

export const toTable = (opts = {}) => {
  const table = createTable(opts);
  const colValues = colValuesByFields(opts.fields);
  const padding =
    table.options.style['padding-left'] - table.options.style['padding-right'];
  return observable =>
    observable.pipe(
      map(colValues),
      pipeIf(
        opts.wrapValues,
        map(
          // this force-wraps the column text
          _.map((col, idx) =>
            wrapAnsi(col, table.options.colWidths[idx] - padding, {
              hard: true,
              wordWrap: false
            })
          )
        )
      ),
      reduce((t, row) => {
        // `push` must be used because Table subclasses Array, but
        // doesn't implement concat, so we'd just get a plain Array back...
        t.push(row);
        return t;
      }, table),
      pipeIf(opts.title, startWith(prependTitle(opts.title)))
    );
};
